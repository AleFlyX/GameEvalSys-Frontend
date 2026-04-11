import { ref } from 'vue';

/**
 * 暗黑模式管理 Composable
 * 处理主题切换、系统主题检测和主题持久化
 */
export const useLoginTheme = () => {
  // 当前主题：'light' | 'dark' | 'auto'
  const currentTheme = ref('auto');

  // 实际生效的主题（auto 时根据系统主题判断）
  const effectiveTheme = ref('light');

  // 系统是否为深色模式
  const isDarkMode = ref(false);

  /**
   * 应用主题到 DOM
   * @param {string} theme 主题名称
   */
  const applyTheme = (theme) => {
    const html = document.documentElement;

    if (theme === 'auto') {
      // 自动模式：检查系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme.value = prefersDark ? 'dark' : 'light';
      isDarkMode.value = prefersDark;
      html.setAttribute('data-theme', effectiveTheme.value);
    } else {
      effectiveTheme.value = theme;
      isDarkMode.value = theme === 'dark';
      html.setAttribute('data-theme', theme);
    }
  };

  /**
   * 切换主题
   * @param {string} theme 目标主题
   */
  const toggleTheme = (theme) => {
    if (['light', 'dark', 'auto'].includes(theme)) {
      currentTheme.value = theme;
      applyTheme(theme);
      // 保存主题偏好到 localStorage
      localStorage.setItem('login_theme', theme);
    }
  };

  /**
   * 初始化主题（组件挂载时）
   */
  const initTheme = () => {
    // 优先读取 localStorage 的用户设置
    const savedTheme = localStorage.getItem('login_theme') || 'auto';
    currentTheme.value = savedTheme;
    applyTheme(savedTheme);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (currentTheme.value === 'auto') {
        applyTheme('auto');
      }
    };

    // 兼容不同浏览器的 API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      mediaQuery.addListener(handleThemeChange);
    }

    // 在组件卸载时移除监听器
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  };

  /**
   * 监听 localStorage 变化（支持跨标签页同步）
   */
  const initStorageListener = () => {
    const handleStorageChange = (e) => {
      if (e.key === 'login_theme' && e.newValue) {
        currentTheme.value = e.newValue;
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
