import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Theme, ThemeConfig } from './types';

// Professional Black/Grey and White/Grey theme system
export const themeConfigs: Record<Theme, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'light',
    displayName: 'Light',
    description: 'Clean white and grey theme with subtle black elements',
    colors: {
      primary: '#000000',
      primaryLight: '#1a1a1a',
      secondary: '#f8f9fa',
      accent: '#4f46e5',
      accentHover: '#4338ca',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      bgPrimary: '#ffffff',
      bgSecondary: '#f8f9fa',
      bgTertiary: '#e9ecef',
      textPrimary: '#000000',
      textSecondary: '#495057',
      textMuted: '#6c757d',
      borderColor: '#dee2e6',
      borderColorLight: '#e9ecef'
    },
    borderRadius: 'medium',
    shadows: true
  },
  dark: {
    id: 'dark',
    name: 'dark',
    displayName: 'Dark',
    description: 'Professional black and grey theme with white accents',
    colors: {
      primary: '#ffffff',
      primaryLight: '#f8f9fa',
      secondary: '#2d3748',
      accent: '#6366f1',
      accentHover: '#7c3aed',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      bgPrimary: '#000000',
      bgSecondary: '#1a1a1a',
      bgTertiary: '#2d3748',
      textPrimary: '#ffffff',
      textSecondary: '#e2e8f0',
      textMuted: '#a0aec0',
      borderColor: '#4a5568',
      borderColorLight: '#2d3748'
    },
    borderRadius: 'medium',
    shadows: true
  },
  system: {
    id: 'system',
    name: 'system',
    displayName: 'System',
    description: 'Follows your system theme preference',
    colors: {
      primary: '#000000',
      primaryLight: '#1a1a1a',
      secondary: '#f8f9fa',
      accent: '#4f46e5',
      accentHover: '#4338ca',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      bgPrimary: '#ffffff',
      bgSecondary: '#f8f9fa',
      bgTertiary: '#e9ecef',
      textPrimary: '#000000',
      textSecondary: '#495057',
      textMuted: '#6c757d',
      borderColor: '#dee2e6',
      borderColorLight: '#e9ecef'
    },
    borderRadius: 'medium',
    shadows: true
  }
};

// Theme store
export const currentTheme = writable<Theme>('system');

// Current effective theme (resolves 'system' to actual theme)
export const effectiveTheme = derived(currentTheme, ($currentTheme, set) => {
  if (!browser) {
    set('light');
    return;
  }

  if ($currentTheme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => set(mediaQuery.matches ? 'dark' : 'light');
    
    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => {
      mediaQuery.removeEventListener('change', updateTheme);
    };
  } else {
    set($currentTheme);
  }
});

// Current theme config
export const currentThemeConfig = derived(effectiveTheme, ($effectiveTheme) => {
  return themeConfigs[$effectiveTheme as Theme] || themeConfigs.light;
});

// Theme persistence
function loadThemeFromStorage(): Theme {
  if (!browser) return 'system';
  
  try {
    const stored = localStorage.getItem('wind-turbine-theme');
    if (stored && stored in themeConfigs) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
  }
  
  return 'system';
}

function saveThemeToStorage(theme: Theme) {
  if (!browser) return;
  
  try {
    localStorage.setItem('wind-turbine-theme', theme);
  } catch (error) {
    console.warn('Failed to save theme to storage:', error);
  }
}

// Initialize theme from storage
if (browser) {
  currentTheme.set(loadThemeFromStorage());
}

// Save theme when it changes
currentTheme.subscribe((theme) => {
  saveThemeToStorage(theme);
});

// Theme utility functions
export function setTheme(theme: Theme) {
  currentTheme.set(theme);
}

export function getThemeList(): ThemeConfig[] {
  return Object.values(themeConfigs);
}

export function applyThemeToDOM(themeConfig: ThemeConfig) {
  if (!browser) return;

  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(themeConfig.colors).forEach(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--color-${cssVarName}`, value);
  });

  // Apply border radius
  const radiusMap = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '16px'
  };
  
  if (themeConfig.borderRadius) {
    root.style.setProperty('--border-radius-default', radiusMap[themeConfig.borderRadius]);
  }

  // Apply shadows
  if (themeConfig.shadows === false) {
    root.style.setProperty('--shadow-default', 'none');
    root.style.setProperty('--shadow-hover', 'none');
  } else {
    root.style.setProperty('--shadow-default', '0 1px 3px 0 rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--shadow-hover', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
  }

  // Apply font family
  if (themeConfig.fontFamily) {
    root.style.setProperty('--font-family-default', themeConfig.fontFamily);
  }

  // Set data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', themeConfig.name);
}

// Apply theme when it changes
if (browser) {
  currentThemeConfig.subscribe((themeConfig) => {
    applyThemeToDOM(themeConfig);
  });
}

// Export theme utilities
export const themeUtils = {
  setTheme,
  getThemeList,
  applyThemeToDOM,
  currentTheme,
  effectiveTheme,
  currentThemeConfig
};
