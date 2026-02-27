import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

const hasFirebaseConfig =
  Boolean(environment.firebase.apiKey) &&
  Boolean(environment.firebase.projectId) &&
  Boolean(environment.firebase.appId);

const firebaseProviders = hasFirebaseConfig
  ? [
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
      provideAuth(() => getAuth())
    ]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations(), ...firebaseProviders]
};
