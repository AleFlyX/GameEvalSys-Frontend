import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/modules/themeStore';

let mediaQueryCleanup = null;
let storageCleanup = null;

/**
 * 暗黑模式管理 Composable
 * 统一通过 Pinia 维护主题状态，并负责同步到 DOM
 * @returns {Object} 主题相关状态和方法
 */
export const useTheme = () => {
  const themeStore = useThemeStore();
  const { currentTheme, effectiveTheme, isDarkMode } = storeToRefs(themeStore);

  /**
   * 应用主题到 DOM
   * @param {string} theme 主题名称
   */
  const applyTheme = (theme) => {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const resolvedTheme = theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    themeStore.setCurrentTheme(theme);
    themeStore.setEffectiveTheme(resolvedTheme);

    html.setAttribute('data-theme', resolvedTheme);
    if (resolvedTheme === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  };

  /**
   * 切换主题
   * @param {string} theme 目标主题
   */
  const toggleTheme = (theme) => {
    if (!['light', 'dark', 'auto'].includes(theme)) return;

    themeStore.setCurrentTheme(theme);
    themeStore.persistTheme(theme);
    applyTheme(theme);
  };

  /**
   * 初始化主题（组件挂载时）
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem(themeStore.THEME_STORAGE_KEY) || currentTheme.value || 'auto';
    themeStore.setCurrentTheme(savedTheme);
    applyTheme(savedTheme);

    if (mediaQueryCleanup) {
      return mediaQueryCleanup;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (currentTheme.value === 'auto') {
        applyTheme('auto');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      mediaQuery.addListener(handleThemeChange);
    }

    mediaQueryCleanup = () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
      mediaQueryCleanup = null;
    };

    return mediaQueryCleanup;
  };

  /**
   * 监听 localStorage 变化（支持跨标签页同步）
   */
  const initStorageListener = () => {
    if (storageCleanup) {
      return storageCleanup;
    }

    const handleStorageChange = (e) => {
      if (e.key === themeStore.THEME_STORAGE_KEY && e.newValue) {
        themeStore.setCurrentTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    storageCleanup = () => {
      window.removeEventListener('storage', handleStorageChange);
      storageCleanup = null;
    };

    return storageCleanup;
  };

  /**
   * 获取当前主题的 CSS 变量（用于动态读取）
   */
  const getThemeVariables = () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return {
      bgPrimary: styles.getPropertyValue('--login-bg-primary').trim(),
      cardBg: styles.getPropertyValue('--login-card-bg').trim(),
      text: styles.getPropertyValue('--login-text').trim(),
      textSecondary: styles.getPropertyValue('--login-text-secondary').trim(),
      border: styles.getPropertyValue('--login-border').trim(),
      inputBg: styles.getPropertyValue('--login-input-bg').trim(),
      inputBorder: styles.getPropertyValue('--login-input-border').trim()
    };
  };

  return {
    currentTheme,
    effectiveTheme,
    isDarkMode,
    toggleTheme,
    initTheme,
    initStorageListener,
    getThemeVariables
  };
};
