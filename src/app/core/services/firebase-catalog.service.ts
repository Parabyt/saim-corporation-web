import { Injectable, inject } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable, of } from 'rxjs';

import { Category, Product, Subcategory } from '../models/catalog.models';
import { ContactMessage } from '../models/contact-message.models';
import { RequirementInquiry } from '../models/requirement-inquiry.models';

const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

  upsertCategory(category: Category): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', category.id);
    return setDoc(categoryRef, category).then(() => undefined);
  }

  deleteCategory(id: string): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', id);
    return deleteDoc(categoryRef);
  }

  addSubcategory(subcategory: Omit<Subcategory, 'id'>): Promise<void> {
    const subcategoriesRef = collection(this.firestore, 'subcategories');
    return addDoc(subcategoriesRef, subcategory).then(() => undefined);
  }

  upsertSubcategory(subcategory: Subcategory): Promise<void> {
    const subcategoryRef = doc(this.firestore, 'subcategories', subcategory.id);
    return setDoc(subcategoryRef, subcategory).then(() => undefined);
  }

  deleteSubcategory(id: string): Promise<void> {
    const subcategoryRef = doc(this.firestore, 'subcategories', id);
    return deleteDoc(subcategoryRef);
  }

  addProduct(product: Omit<Product, 'id'>): Promise<void> {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, product).then(() => undefined);
  }

  upsertProduct(product: Product): Promise<void> {
    const productRef = doc(this.firestore, 'products', product.id);
    return setDoc(productRef, product).then(() => undefined);
  }

  deleteProduct(id: string): Promise<void> {
    const productRef = doc(this.firestore, 'products', id);
    return deleteDoc(productRef);
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
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type. Use JPG, PNG, or WEBP.');
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error('Image is too large. Maximum allowed size is 2 MB.');
    }

    const uniqueName = `${Date.now()}-${file.name}`;
    const storageRef = ref(this.storage, `${bucketFolder}/${uniqueName}`);
    return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
  }

  // Fallback helper for offline mode. Useful if Firebase credentials are not configured yet.
  getOfflineMessage(): Observable<string> {
    return of('Firebase is not configured yet. Update src/environments/environment.ts');
  }
}
