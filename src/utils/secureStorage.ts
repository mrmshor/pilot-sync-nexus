// Secure client-side storage utility with encryption for sensitive data
import { logger } from './logger';

// Simple encryption for client-side data (not for highly sensitive data)
class SecureStorage {
  private readonly key = 'app-secure-key-v1';

  private encrypt(data: string): string {
    // Basic obfuscation - for production, use proper encryption
    return btoa(encodeURIComponent(data));
  }

  private decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      logger.error('Failed to decrypt data:', error);
      return '';
    }
  }

  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(`${this.key}-${key}`, encrypted);
    } catch (error) {
      logger.error('Failed to store data securely:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(`${this.key}-${key}`);
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      if (!decrypted) return null;
      
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Failed to retrieve data securely:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.key}-${key}`);
    } catch (error) {
      logger.error('Failed to remove data:', error);
    }
  }

  clear(): void {
    try {
      // Clear only app-specific keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Failed to clear secure storage:', error);
    }
  }

  // Migration utility to move existing data to secure storage
  migrateFromPlainStorage(oldKey: string, newKey: string): boolean {
    try {
      const plainData = localStorage.getItem(oldKey);
      if (plainData) {
        this.setItem(newKey, JSON.parse(plainData));
        localStorage.removeItem(oldKey);
        logger.info(`Migrated data from ${oldKey} to secure storage`);
        return true;
      }
    } catch (error) {
      logger.error('Failed to migrate data to secure storage:', error);
    }
    return false;
  }
}

export const secureStorage = new SecureStorage();