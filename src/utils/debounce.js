/**
 * 防抖函数：频繁触发时，只在最后一次触发的延迟后执行
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Object} [options={}] - 配置项
 * @param {boolean} [options.immediate=false] - 是否立即执行（第一次触发时执行，后续触发不执行，直到延迟结束）
 * @returns {Function} 防抖后的函数（包含取消防抖的方法 cancel）
 */
export function debounce(fn, delay, options = {}) {
  let timer = null; // 闭包保存定时器ID，避免全局污染
  const { immediate = false } = options;
  let isInvoked = false; // 标记是否已立即执行过

  // 防抖核心函数
  const debounced = function (...args) {
    // 保存原函数的this指向（比如DOM事件中的this）
    const context = this;

    // 每次触发，先清空上一次的定时器
    if (timer) clearTimeout(timer);

    // 立即执行的逻辑：第一次触发时执行，后续触发只重置定时器
    if (immediate && !isInvoked) {
      fn.apply(context, args); // 绑定this并传参
      isInvoked = true; // 标记已执行
    } else {
      // 非立即执行：重置定时器，延迟执行
      timer = setTimeout(() => {
        fn.apply(context, args); // 绑定this并传参
        isInvoked = false; // 延迟执行后重置标记，允许下次立即执行
        timer = null; // 清空定时器ID
      }, delay);
    }
  };

  // 新增取消防抖的方法（实用扩展）
  debounced.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    isInvoked = false; // 重置状态
  };

  return debounced;
}
