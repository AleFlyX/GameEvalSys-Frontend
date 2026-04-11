import { ref, computed } from 'vue';
import { REMEMBER_KEY, STORAGE_KEY, MAX_HISTORY_SIZE } from '../config/loginConfig'
/**
 * 账号记忆管理 Composable
 * 处理账号历史记录的存储、读取和管理
 */
export const useLoginHistory = () => {
  // 账号历史列表
  const accountHistory = ref([]);

  // 是否记住我
  const rememberMe = ref(false);

  /**
   * 初始化历史数据
   */
  const initHistory = () => {
    // 从 localStorage 读取账号历史
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        accountHistory.value = JSON.parse(savedHistory);
      } catch (e) {
        console.warn('账号历史数据解析失败:', e);
        accountHistory.value = [];
      }
    }

    // 读取记住我状态
    const savedRememberMe = localStorage.getItem(REMEMBER_KEY);
    rememberMe.value = savedRememberMe === 'true';
  };

  /**
   * 添加账号到历史
   * @param {string} username 用户名
   */
  const addToHistory = (username) => {
    if (!username || username.trim() === '') return;

    // 检查是否已存在
    const existingIndex = accountHistory.value.findIndex(
      acc => acc.username === username
    );

    if (existingIndex > -1) {
      // 更新存在的账号（移到最前）
      const existing = accountHistory.value.splice(existingIndex, 1)[0];
      existing.lastLogin = Date.now();
      accountHistory.value.unshift(existing);
    } else {
      // 添加新账号
      accountHistory.value.unshift({
        username,
        lastLogin: Date.now()
      });
    }

    // 限制列表大小
    if (accountHistory.value.length > MAX_HISTORY_SIZE) {
      accountHistory.value = accountHistory.value.slice(0, MAX_HISTORY_SIZE);
    }

    // 保存到 localStorage
    saveHistory();
  };

  /**
   * 删除历史账号
   * @param {string} username 用户名
   */
  const removeFromHistory = (username) => {
    accountHistory.value = accountHistory.value.filter(
      acc => acc.username !== username
    );
    saveHistory();
  };

  /**
   * 清空所有历史
   */
  const clearHistory = () => {
    accountHistory.value = [];
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * 保存历史到 localStorage
   */
  const saveHistory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accountHistory.value));
  };

  /**
   * 获取最后登录的账号
   * @returns {Object|null} 最后登录的账号对象或 null
   */
  const getLastLoginAccount = () => {
    return accountHistory.value.length > 0 ? accountHistory.value[0] : null;
  };

  /**
   * 设置记住我状态
   * @param {boolean} value 是否记住
   */
  const setRememberMe = (value) => {
    rememberMe.value = value;
    localStorage.setItem(REMEMBER_KEY, String(value));
  };

  /**
   * 格式化时间戳
   * @param {number} timestamp 时间戳
   * @returns {string} 格式化后的时间
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 历史账号计数
  const historyCount = computed(() => accountHistory.value.length);

  return {
    accountHistory,
    rememberMe,
    historyCount,
    initHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    saveHistory,
    getLastLoginAccount,
    setRememberMe,
    formatTime
  };
};
