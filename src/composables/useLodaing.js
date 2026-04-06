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
   * @param {Object} options - 配置
   * @param {boolean} options.catchError - 是否自动捕获错误并打印，默认 false
   * @returns {Promise} 异步任务的返回值
   */
  async function requestWithPageLoading(fn, catchError = false) {
    loadingStore.start()
    try {
      return await fn();
    }
    catch (e) {
      if (catchError) {
        console.error(`[useAsyncLoading:${key}]`, e)
      } else {
        throw e // 让调用者自己处理
      }
    }
    finally {
      loadingStore.end();
    }
  }
  return {
    isLoading: isLoading.value,
    isSkeleton: isSkeleton.value,
    start, // 手动开始
    end,  //手动结束
    requestWithPageLoading //自动管理结束开始
  }
}
