/* ============================================
   THEME SERVICE - LIGHT/DARK MODE PERSISTENCE
   ============================================ */

import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /* ========== STATE LOGIC ========== */
  private readonly STORAGE_KEY = 'verduleate-admin-theme';
  
  /** Reactive signal for current theme */
  public currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Effect to sync theme changes to DOM and localStorage
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.persistTheme(theme);
    });
  }

  /* ========== THEME LOGIC ========== */

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    this.currentTheme.update(current => current === 'light' ? 'dark' : 'light');
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  /* ========== PERSISTENCE LOGIC ========== */

  /**
   * Get theme from localStorage or system preference
   */
  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Fall back to system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  /**
   * Save theme to localStorage
   */
  private persistTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  /**
   * Apply theme class to document root
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }
}
