import { toRaw } from "vue";

/**
 * 深拷贝函数（解决 structuredClone 克隆响应式对象报错问题）
 * @param {Proxy} data
 * @returns {Object|Array} 克隆的数据
 */
export const safeDeepClone = (data) => {
  // 1：取出响应式对象的原始数据（关键！）
  const rawData = toRaw(data);

  // 2：空值兜底，避免 null/undefined
  if (rawData === null || rawData === undefined) {
    return Array.isArray(data) ? [] : {};
  }

  // 3：针对 structuredClone 不支持的类型，降级为浅拷贝（按需扩展）
  try {
    // 优先用 structuredClone 深拷贝
    return structuredClone(rawData);
  } catch (e) {
    // 克隆失败（比如包含函数/Symbol），降级为浅拷贝（根据业务选：浅拷贝/过滤特殊属性）
    console.warn('structuredClone 克隆失败，降级为浅拷贝：', e);
    // 数组浅拷贝
    if (Array.isArray(rawData)) {
      return [...rawData];
    }
    // 对象浅拷贝
    if (typeof rawData === 'object') {
      return { ...rawData };
    }
    // 基础类型直接返回
    return rawData;
  }
};
