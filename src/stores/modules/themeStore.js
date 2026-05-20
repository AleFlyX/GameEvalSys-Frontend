import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const THEME_STORAGE_KEY = 'login_theme';

export const useThemeStore = defineStore('themeStore', () => {
  const currentTheme = ref(localStorage.getItem(THEME_STORAGE_KEY) || 'auto');
  const effectiveTheme = ref('light');

  const isDarkMode = computed(() => effectiveTheme.value === 'dark');

  function setCurrentTheme(theme) {
    currentTheme.value = theme;
  }

  function setEffectiveTheme(theme) {
    effectiveTheme.value = theme;
  }

  function persistTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  return {
    currentTheme,
    effectiveTheme,
    isDarkMode,
    setCurrentTheme,
    setEffectiveTheme,
    persistTheme,
    THEME_STORAGE_KEY,
  };
});
