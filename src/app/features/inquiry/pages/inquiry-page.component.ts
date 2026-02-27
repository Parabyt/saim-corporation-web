import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RequirementInquiryDraft } from '../../../core/models/requirement-inquiry.models';
import { RequirementInquiryService } from '../../../core/services/requirement-inquiry.service';

@Component({
  selector: 'app-inquiry-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inquiry-page.component.html',
  styleUrl: './inquiry-page.component.scss'
})
export class InquiryPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly inquiryService = inject(RequirementInquiryService);

  readonly submitState = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  readonly submitMessage = signal<string>('');
  readonly isUploading = signal(false);

  readonly inquiryForm = this.formBuilder.nonNullable.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    contactPerson: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    country: ['', Validators.required],
    productFocus: ['', [Validators.required, Validators.minLength(6)]],
    targetQuantity: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(20)]],
    referenceImageUrl: ['']
  });

  async onReferenceSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) {
      return;
    }

    this.isUploading.set(true);
    const uploadedUrl = await this.inquiryService.uploadReferenceImage(file);
    this.isUploading.set(false);

    if (!uploadedUrl) {
      this.submitMessage.set('Image upload is unavailable right now. You can still submit without an image URL.');
      return;
    }

    this.inquiryForm.controls.referenceImageUrl.setValue(uploadedUrl);
    this.submitMessage.set('Reference image uploaded successfully.');
  }

  async submitInquiry(): Promise<void> {
    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      this.submitState.set('error');
      this.submitMessage.set('Please complete all required fields.');
      return;
    }

    this.submitState.set('submitting');
    this.submitMessage.set('');

    const formValue = this.inquiryForm.getRawValue();
    const payload: RequirementInquiryDraft = {
      ...formValue,
      referenceImageUrl: formValue.referenceImageUrl || undefined,
      source: 'home-trade-strip'
    };

    try {
      const result = await this.inquiryService.submitRequirement(payload);
      this.submitState.set('success');
      this.submitMessage.set(
        result.persistedTo === 'firebase'
          ? 'Requirements sent successfully. Our export team will contact you shortly.'
          : 'Requirements captured successfully. Firebase is unavailable, so this is saved locally for now.'
      );
      this.inquiryForm.reset({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        country: '',
        productFocus: '',
        targetQuantity: '',
        message: '',
        referenceImageUrl: ''
      });
    } catch {
      this.submitState.set('error');
      this.submitMessage.set('Submission failed. Please try again.');
    }
  }
}
