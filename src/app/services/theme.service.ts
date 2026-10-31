/* ============================================
   THEME SERVICE - LIGHT/DARK MODE PERSISTENCE
   ============================================ */

import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /* ========== STATE LOGIC ========== */
  private readonly STORAGE_KEY = 'verduleate-theme-preference';
  private systemMediaQuery: MediaQueryList | null = null;
  private systemListener: ((event: MediaQueryListEvent) => void) | null = null;
  private systemIsDark = signal<boolean>(false);
  
  /** Reactive signal for current theme */
  public currentPreference = signal<ThemePreference>(this.getStoredPreference());
  public currentTheme = computed<Theme>(() => this.resolveTheme(this.currentPreference(), this.systemIsDark()));

  constructor() {
    this.initSystemListener();

    // Apply theme immediately before effect registration
    const initialTheme = this.resolveTheme(this.currentPreference(), this.systemIsDark());
    this.applyThemeImmediate(initialTheme);

    // Effect to sync theme changes to DOM and localStorage
    effect(() => {
      const preference = this.currentPreference();
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.persistPreference(preference);
    });
  }

  /* ========== THEME LOGIC ========== */

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const next = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentPreference.set(next);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentPreference.set(theme);
  }

  /**
   * Set a specific preference (light, dark, system)
   */
  setPreference(preference: ThemePreference): void {
    this.currentPreference.set(preference);
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  isSystem(): boolean {
    return this.currentPreference() === 'system';
  }

  /* ========== PERSISTENCE LOGIC ========== */

  /**
   * Get theme from localStorage or system preference
   */
  private getStoredPreference(): ThemePreference {
    if (typeof window === 'undefined') return 'dark';
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return 'dark';
  }

  /**
   * Save theme to localStorage
   */
  private persistPreference(preference: ThemePreference): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, preference);
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

  /**
   * Apply theme immediately on initialization (synchronous)
   */
  private applyThemeImmediate(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.add(theme);
      root.classList.remove(theme === 'light' ? 'dark' : 'light');
    }
  }

  private resolveTheme(preference: ThemePreference, systemIsDark: boolean): Theme {
    if (preference === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return preference;
  }

  private initSystemListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    this.systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemIsDark.set(this.systemMediaQuery.matches);
    this.systemListener = (event: MediaQueryListEvent) => {
      this.systemIsDark.set(event.matches);
    };

    this.systemMediaQuery.addEventListener('change', this.systemListener);
  }
}
