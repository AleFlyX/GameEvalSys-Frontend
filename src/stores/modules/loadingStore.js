import { defineStore } from "pinia";
import { ref, reactive } from 'vue';
/**
 * 用于各个业务组件触发layout页面中的main部分显示全页面加载动画的统一管理store
 */

export const useLoadingStore = defineStore('loadingStore', () => {
  // 是否正在加载状态
  const map = reactive({});
  const showLoadingGap = ref(200)

  /**
    * 判断某个 key 是否处于 loading 状态（显示“加载中”）
    * @param {string} key - 标识符，默认为 'global'
    * @returns {boolean}
    */
  const isLoading = (key = 'global') => {
    return !!map[key]?.showLoading
  }

  /**
   * 判断某个 key 是否应显示骨架屏
   * @param {string} key - 标识符，默认为 'global'
   * @returns {boolean}
   */
  const isSkeleton = (key = 'global') => {
    return !!map[key]?.showSkeleton
  }

  /**
  * 开始加载（通常在请求完成前调用）
  * @param {string} key - 标识符，默认为 'global'
  */
  function start(key = 'global') {
    if (!map[key]) {
      map[key] = {
        count: 0,   // 统计当前共有多少个加载，用于多个请求并发
        startTime: 0,  // 触发时间
        showLoading: false, // 显示加载动画
        showSkeleton: false, // 显示骨架屏
        timer: null
      }
    }

    const item = map[key];
    item.count++;

    if (item.count === 1) { //只有存在正在加载的情况下才触发加载
      item.startTime = Date.now();

      // 防止timer没在end中被清理
      if (item.timer) clearTimeout(item.timer)

      item.timer = setTimeout(() => {
        // 定时器回调中需重新获取当前项，避免 end 已将其删除而导致状态残留
        const currentItem = map[key]

        const duration = Date.now() - currentItem.startTime;

        if (duration >= 200) {
          currentItem.showLoading = true;
        }
        if (duration >= 1200) {
          currentItem.showSkeleton = true;
        }
      }, showLoadingGap.value);
    }
  }

  /**
  * 结束加载（通常在请求完成后调用）
  * @param {string} key - 标识符，默认为 'global'
  */
  function end(key = 'global') {
    if (!map[key]) return;

    const item = map[key];
    item.count--;

    if (item.count <= 0) {
      if (item.timer) {
        clearTimeout(item.timer);
        item.timer = null;
      }
      item.showLoading = false;
      item.showSkeleton = false;
      delete map[key];
    }

  }

  return {
    map,
    isLoading,
    isSkeleton,
    start,
    end
  }
})
