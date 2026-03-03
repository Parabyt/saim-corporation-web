import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ContactMessageDraft } from '../../../core/models/contact-message.models';
import { ContactMessageService } from '../../../core/services/contact-message.service';
import { ContentStoreService } from '../../../core/services/content-store.service';
import { environment } from '../../../../environments/environment';

interface RecaptchaApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    }
  ): number;
  reset(widgetId?: number): void;
}

const RECAPTCHA_SCRIPT_URLS = [
  'https://www.google.com/recaptcha/api.js?render=explicit',
  'https://www.recaptcha.net/recaptcha/api.js?render=explicit'
];

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent implements AfterViewInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly contactService = inject(ContactMessageService);
  private readonly contentStore = inject(ContentStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private recaptchaLoader: Promise<void> | null = null;
  private recaptchaWidgetId: number | null = null;
  @ViewChild('recaptchaHost') private recaptchaHost?: ElementRef<HTMLDivElement>;

  readonly submitState = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  readonly statusMessage = signal('');
  readonly isCaptchaEnabled = signal(false);
  readonly isCaptchaReady = signal(false);
  readonly isCaptchaLoadFailed = signal(false);
  readonly captchaToken = signal('');
  readonly recaptchaSiteKey = environment.recaptchaSiteKey;

  readonly companyProfile = this.contentStore.companyProfile;
  readonly channels = computed(() => [
    {
      title: 'Email',
      value: this.companyProfile().email,
      detail: 'Best for quotations, specs, and documentation.'
    },
    {
      title: 'Phone',
      value: this.companyProfile().phone,
      detail: 'Mon-Sat, 9:00 AM to 7:00 PM (PKT).'
    },
    {
      title: 'Office',
      value: this.companyProfile().address,
      detail: 'Manufacturing and export coordination center.'
    }
  ]);
  readonly activeSocials = computed(() => this.companyProfile().socials.filter((item) => item.enabled && item.url.trim().length > 0));

  readonly contactForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    country: ['', Validators.required],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(20)]],
    captchaConfirmed: [false, Validators.requiredTrue],
    captchaToken: [''],
    acceptedTerms: [false, Validators.requiredTrue]
  });

  constructor() {
    this.contactForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncCaptchaState();
    });
    this.syncCaptchaState();
  }

  ngAfterViewInit(): void {
    this.initializeRecaptcha();
  }

  ngOnDestroy(): void {
    if (this.recaptchaWidgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(this.recaptchaWidgetId);
    }
  }

  async submitContactMessage(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.submitState.set('error');
      this.statusMessage.set('Please complete required fields, captcha, and terms acceptance.');
      return;
    }

    this.submitState.set('submitting');
    this.statusMessage.set('');

    const value = this.contactForm.getRawValue();
    const payload: ContactMessageDraft = {
      ...value,
      captchaToken: this.captchaToken() || undefined,
      source: 'contact-page'
    };

    try {
      const result = await this.contactService.sendMessage(payload);
      this.submitState.set('success');
      this.statusMessage.set(
        result.persistedTo === 'firebase'
          ? 'Message sent successfully. Our team will get back to you shortly.'
          : 'Message saved locally. Firebase is unavailable right now; we will enable cloud delivery once configured.'
      );
      this.contactForm.reset({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        country: '',
        subject: '',
        message: '',
        captchaConfirmed: false,
        captchaToken: '',
        acceptedTerms: false
      });
      this.captchaToken.set('');
      if (this.recaptchaWidgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(this.recaptchaWidgetId);
      }
    } catch {
      this.submitState.set('error');
      this.statusMessage.set('Message could not be sent. Please try again.');
    }
  }

  private async initializeRecaptcha(): Promise<void> {
    if (!this.recaptchaSiteKey) {
      this.isCaptchaLoadFailed.set(true);
      this.statusMessage.set('reCAPTCHA site key is missing. Configure it in environment files.');
      return;
    }

    try {
      await this.loadRecaptchaScript();
      this.renderRecaptchaWidget();
    } catch {
      this.isCaptchaLoadFailed.set(true);
      this.statusMessage.set('Unable to load reCAPTCHA right now. Please retry shortly.');
    }
  }

  private loadRecaptchaScript(): Promise<void> {
    if (window.grecaptcha?.render) {
      return Promise.resolve();
    }

    if (this.recaptchaLoader) {
      return this.recaptchaLoader;
    }

    this.recaptchaLoader = this.loadRecaptchaScriptWithFallback();

    return this.recaptchaLoader;
  }

  private async loadRecaptchaScriptWithFallback(): Promise<void> {
    let lastError: unknown = null;

    for (const url of RECAPTCHA_SCRIPT_URLS) {
      try {
        await this.tryLoadRecaptchaScript(url);
        await this.waitForRecaptchaReady();
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error('recaptcha_load_failed');
  }

  private tryLoadRecaptchaScript(url: string): Promise<void> {
    if (window.grecaptcha?.render) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement | null;
      if (existing) {
        if (window.grecaptcha?.render) {
          resolve();
          return;
        }

        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('script_load_failed')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-recaptcha-script', 'true');
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('script_load_failed')), { once: true });
      document.head.appendChild(script);
    });
  }

  private async waitForRecaptchaReady(): Promise<void> {
    const attempts = 25;
    const delayMs = 120;

    for (let i = 0; i < attempts; i += 1) {
      if (window.grecaptcha?.render) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error('grecaptcha_not_ready');
  }

  private renderRecaptchaWidget(): void {
    if (this.recaptchaWidgetId !== null || !window.grecaptcha || !this.recaptchaHost?.nativeElement) {
      return;
    }

    this.recaptchaWidgetId = window.grecaptcha.render(this.recaptchaHost.nativeElement, {
      sitekey: this.recaptchaSiteKey,
      callback: (token) => this.onCaptchaResolved(token),
      'expired-callback': () => this.onCaptchaExpired(),
      'error-callback': () => this.onCaptchaError()
    });
    this.isCaptchaReady.set(true);
  }

  private onCaptchaResolved(token: string): void {
    const hasToken = token.length > 0;
    this.captchaToken.set(token);
    this.contactForm.controls.captchaToken.setValue(token, { emitEvent: false });
    this.contactForm.controls.captchaConfirmed.setValue(hasToken, { emitEvent: false });
  }

  private onCaptchaExpired(): void {
    this.clearCaptchaSelection();
  }

  private onCaptchaError(): void {
    this.clearCaptchaSelection();
  }

  private clearCaptchaSelection(): void {
    this.captchaToken.set('');
    this.contactForm.controls.captchaToken.setValue('', { emitEvent: false });
    this.contactForm.controls.captchaConfirmed.setValue(false, { emitEvent: false });
  }

  private syncCaptchaState(): void {
    const controls = this.contactForm.controls;
    const enableCaptcha =
      controls.fullName.valid &&
      controls.companyName.valid &&
      controls.email.valid &&
      controls.phone.valid &&
      controls.country.valid &&
      controls.subject.valid &&
      controls.message.valid &&
      controls.acceptedTerms.value;

    this.isCaptchaEnabled.set(enableCaptcha);

    if (!enableCaptcha && controls.captchaConfirmed.value) {
      this.clearCaptchaSelection();
      if (this.recaptchaWidgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(this.recaptchaWidgetId);
      }
    }
  }
}
