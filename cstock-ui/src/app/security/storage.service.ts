import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getItem(key: string): string | null {
    if (this.isBrowser && typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isBrowser && typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }

  getJsonItem<T>(key: string): T | null {
    const item = this.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch {
        return null;
      }
    }
    return null;
  }

  setJsonItem(key: string, value: any): void {
    this.setItem(key, JSON.stringify(value));
  }
}
