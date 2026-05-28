// 这个文件定义了一个 Vue 指令 v-dev，用于在开发环境中根据全局开关和条件显示元素。
// 通过环境变量 VITE_DEV_DEBUG_ENABLED 控制全局开关，只有当该变量为 'true' 时，v-dev 指令才会生效。
const IS_DEV_DEBUG_ENABLED = (import.meta.env.VITE_DEV_DEBUG_ENABLED || 'false') === 'true'
console.log('开发环境调试开关状态:', IS_DEV_DEBUG_ENABLED)
/**
 * 更新元素的显示状态
 * @param {HTMLElement} el
 * @param {Object} binding
 * @returns
 */
function updateDisplay(el, binding) {
  if (!IS_DEV_DEBUG_ENABLED) {
    el.style.display = 'none';
    return;
  }
  // 如果使用了 v-dev.never 修饰符，无论全局开关如何都隐藏元素
  if (binding.modifiers.never) {
    el.style.display = 'none';
    return;
  }
  // 获取 v-dev 指令的值，如果没有提供则默认为 true
  const shouldShow = binding.value === undefined ? true : Boolean(binding.value);
  // 根据全局开关和指令值决定元素是否显示
  el.style.display = shouldShow ? '' : 'none';
}


/**
 * v-dev 指令
 * 用法：
 *   v-dev               → 全局开关开启时显示
 *   v-dev="condition"   → 全局开关开启且 condition 为真值时显示
 */
export default {
  mounted(el, binding) {
    updateDisplay(el, binding)
  },
  updated(el, binding) {
    updateDisplay(el, binding)
  }
}
