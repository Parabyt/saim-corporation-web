import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AUTH_REPOSITORY, CONTENT_REPOSITORY, MEDIA_REPOSITORY, SUBMISSION_REPOSITORY } from './core/ports/backend.port';
import { PhpBackendService } from './core/services/php-backend.service';
import { ContentStoreService } from './core/services/content-store.service';
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations(),
    ...[CONTENT_REPOSITORY, AUTH_REPOSITORY, MEDIA_REPOSITORY, SUBMISSION_REPOSITORY].map(provide => ({ provide, useExisting: PhpBackendService })),
    { provide: APP_INITIALIZER, multi: true, deps: [ContentStoreService], useFactory: (store: ContentStoreService) => () => store.refresh() }
  ]
};
