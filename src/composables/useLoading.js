import { useLoadingStore } from "@/stores/modules/loadingStore";
import { computed } from 'vue';

/**
 * 自动为异步任务添加加载状态管理
 * @param {string} key - 加载标识
 * @returns {Function} 包装函数 (asyncFn, options?) => Promise
 */
export const useLoading = (key = 'global') => {
  const loadingStore = useLoadingStore();

  const isLoading = computed(() => loadingStore.isLoading(key));
  const isSkeleton = computed(() => loadingStore.isSkeleton(key));

  const start = () => loadingStore.start(key);
  const end = () => loadingStore.end(key);

  /**
   * 执行异步任务，自动控制 start/end
   * @param {Function} asyncFn - 返回 Promise 的异步函数
   * @param {Any} args 传入的异步函数的所需参数（例：requestWithLoading(api.getUser,114514,true)）
   * @returns {Promise} 异步任务的返回值
   */
  async function requestWithLoading(fn, ...args) {
    loadingStore.start(key)
    try {
      return await fn(...args);
    }
    finally {
      loadingStore.end(key);
    }
  }
  return {
    isLoading,
    isSkeleton,
    start, // 手动开始
    end,  //手动结束
    requestWithLoading //自动管理结束开始
  }
}
