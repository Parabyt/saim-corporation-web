import { Injectable, inject } from '@angular/core';
import { addDoc, collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';

import { Category, Product, Subcategory } from '../models/catalog.models';
import { ContactMessage } from '../models/contact-message.models';
import { RequirementInquiry } from '../models/requirement-inquiry.models';

@Injectable({ providedIn: 'root' })
export class FirebaseCatalogService {
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);

  getCategories(): Observable<Category[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    return collectionData(categoriesRef, { idField: 'id' }) as Observable<Category[]>;
  }

  getSubcategories(): Observable<Subcategory[]> {
    const subcategoriesRef = collection(this.firestore, 'subcategories');
    return collectionData(subcategoriesRef, { idField: 'id' }) as Observable<Subcategory[]>;
  }

  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }

  addCategory(category: Omit<Category, 'id'>): Promise<void> {
    const categoriesRef = collection(this.firestore, 'categories');
    return addDoc(categoriesRef, category).then(() => undefined);
  }

  addSubcategory(subcategory: Omit<Subcategory, 'id'>): Promise<void> {
    const subcategoriesRef = collection(this.firestore, 'subcategories');
    return addDoc(subcategoriesRef, subcategory).then(() => undefined);
  }

  addProduct(product: Omit<Product, 'id'>): Promise<void> {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, product).then(() => undefined);
  }

  addRequirement(requirement: Omit<RequirementInquiry, 'id'>): Promise<void> {
    const requirementsRef = collection(this.firestore, 'requirements');
    return addDoc(requirementsRef, requirement).then(() => undefined);
  }

  addContactMessage(message: Omit<ContactMessage, 'id'>): Promise<void> {
    const contactMessagesRef = collection(this.firestore, 'contactMessages');
    return addDoc(contactMessagesRef, message).then(() => undefined);
  }

  uploadImage(file: File, bucketFolder: 'categories' | 'subcategories' | 'products' | 'requirements'): Promise<string> {
    const uniqueName = `${Date.now()}-${file.name}`;
    const storageRef = ref(this.storage, `${bucketFolder}/${uniqueName}`);
    return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
  }

  // Fallback helper for offline mode. Useful if Firebase credentials are not configured yet.
  getOfflineMessage(): Observable<string> {
    return of('Firebase is not configured yet. Update src/environments/environment.ts');
  }
}
