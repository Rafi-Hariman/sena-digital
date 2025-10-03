import { Injectable } from '@angular/core';

export interface FormStorageData {
  registrasi?: {
    response?: {
      user?: {
        id?: any;
      };
    };
  };
  informasiMempelai?: {
    updatedData?: any;
    [key: string]: any;
  };
  step?: number;
  [key: string]: any;
}

export interface ImageStorageItem {
  id: string;
  base64Data: string;
  timestamp: number;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'WeddingAppDB';
  private dbVersion = 1;
  private imageStoreName = 'images';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB for large file storage
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create images store if it doesn't exist
        if (!db.objectStoreNames.contains(this.imageStoreName)) {
          const imageStore = db.createObjectStore(this.imageStoreName, { keyPath: 'id' });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Store form metadata in localStorage (small data only)
   */
  setFormData(data: FormStorageData): boolean {
    try {
      // Remove any image data before storing in localStorage
      const sanitizedData = this.sanitizeFormData(data);
      const jsonString = JSON.stringify(sanitizedData);
      
      // Check if data is too large (leave 1MB buffer)
      if (jsonString.length > 4 * 1024 * 1024) {
        console.warn('Form data too large for localStorage, truncating...');
        return false;
      }

      localStorage.setItem('formData', jsonString);
      return true;
    } catch (error) {
      console.error('Failed to store form data:', error);
      return false;
    }
  }

  /**
   * Get form metadata from localStorage
   */
  getFormData(): FormStorageData {
    try {
      const data = localStorage.getItem('formData');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to retrieve form data:', error);
      return {};
    }
  }

  /**
   * Store image in IndexedDB
   */
  async setImage(id: string, base64Data: string, type: string = 'image/png'): Promise<boolean> {
    try {
      await this.initDB();
      
      if (!this.db) {
        console.error('IndexedDB not available');
        return false;
      }

      const transaction = this.db.transaction([this.imageStoreName], 'readwrite');
      const store = transaction.objectStore(this.imageStoreName);

      const imageItem: ImageStorageItem = {
        id,
        base64Data,
        timestamp: Date.now(),
        type
      };

      return new Promise((resolve, reject) => {
        const request = store.put(imageItem);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.error('Failed to store image:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error storing image:', error);
      return false;
    }
  }

  /**
   * Get image from IndexedDB
   */
  async getImage(id: string): Promise<string | null> {
    try {
      await this.initDB();
      
      if (!this.db) {
        console.error('IndexedDB not available');
        return null;
      }

      const transaction = this.db.transaction([this.imageStoreName], 'readonly');
      const store = transaction.objectStore(this.imageStoreName);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          const result = request.result as ImageStorageItem;
          resolve(result ? result.base64Data : null);
        };
        
        request.onerror = () => {
          console.error('Failed to retrieve image:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error retrieving image:', error);
      return null;
    }
  }

  /**
   * Delete image from IndexedDB
   */
  async deleteImage(id: string): Promise<boolean> {
    try {
      await this.initDB();
      
      if (!this.db) {
        return false;
      }

      const transaction = this.db.transaction([this.imageStoreName], 'readwrite');
      const store = transaction.objectStore(this.imageStoreName);

      return new Promise((resolve) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Clean up old images (older than 7 days)
   */
  async cleanupOldImages(): Promise<void> {
    try {
      await this.initDB();
      
      if (!this.db) return;

      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const transaction = this.db.transaction([this.imageStoreName], 'readwrite');
      const store = transaction.objectStore(this.imageStoreName);
      const index = store.index('timestamp');

      const range = IDBKeyRange.upperBound(sevenDaysAgo);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Error cleaning up old images:', error);
    }
  }

  /**
   * Get user ID safely from form data
   */
  getUserId(): any {
    try {
      const formData = this.getFormData();
      return formData?.registrasi?.response?.user?.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Update form data safely
   */
  updateFormData(updates: Partial<FormStorageData>): boolean {
    try {
      const existingData = this.getFormData();
      const updatedData = { ...existingData, ...updates };
      return this.setFormData(updatedData);
    } catch (error) {
      console.error('Error updating form data:', error);
      return false;
    }
  }

  /**
   * Remove image data from form data to prevent localStorage quota issues
   */
  private sanitizeFormData(data: FormStorageData): FormStorageData {
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove base64 image data from nested objects
    if (sanitized.informasiMempelai?.updatedData) {
      const updatedData = sanitized.informasiMempelai.updatedData;
      
      // Remove image fields that contain base64 data
      ['photo_pria', 'photo_wanita', 'cover_photo', 'photo'].forEach(field => {
        if (updatedData[field] && typeof updatedData[field] === 'string' && updatedData[field].length > 1000) {
          // Keep a reference but remove the actual base64 data
          updatedData[`${field}_stored`] = true;
          delete updatedData[field];
        }
      });
    }

    return sanitized;
  }

  /**
   * Migrate existing localStorage images to IndexedDB
   */
  async migrateExistingImages(): Promise<void> {
    try {
      const formData = this.getFormData();
      
      if (formData?.informasiMempelai?.updatedData) {
        const updatedData = formData.informasiMempelai.updatedData;
        const imageFields = ['photo_pria', 'photo_wanita', 'cover_photo', 'photo'];
        
        for (const field of imageFields) {
          if (updatedData[field] && typeof updatedData[field] === 'string' && updatedData[field].length > 1000) {
            // This looks like base64 data, migrate it
            await this.setImage(field, updatedData[field]);
            
            // Mark as migrated and remove from localStorage
            updatedData[`${field}_stored`] = true;
            delete updatedData[field];
          }
        }
        
        // Update localStorage with cleaned data
        this.setFormData(formData);
      }
    } catch (error) {
      console.error('Error migrating images:', error);
    }
  }

  /**
   * Clear all storage (for testing/reset purposes)
   */
  async clearAllStorage(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem('formData');
      
      // Clear IndexedDB
      await this.initDB();
      if (this.db) {
        const transaction = this.db.transaction([this.imageStoreName], 'readwrite');
        const store = transaction.objectStore(this.imageStoreName);
        store.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}