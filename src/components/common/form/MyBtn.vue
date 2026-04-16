<template>
  <button class="btn" :class="[
    `btn--${type || 'default'}`,
    `btn--${size}`,
    {
      'btn--loading': loading,
      'btn--disabled': disabled,
    }
  ]" :disabled="disabled || loading" @click="handleClick">
    <span class="btn__content">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: '', // primary, danger, pro, link
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['click'])

const handleClick = (e) => {
  if (props.disabled || props.loading) return
  emits('click', e)
}
</script>

<style scoped>
/* ---------- 基础按钮样式 ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  white-space: nowrap;
}

/* 尺寸变体 */
.btn--small {
  padding: 4px 12px;
  font-size: 12px;
}

.btn--medium {
  padding: 8px 20px;
  font-size: 14px;
}

.btn--large {
  padding: 12px 28px;
  font-size: 16px;
}

/* 默认类型（无 type 时） */
.btn--default {
  background-color: #f5f7fa;
  color: #606266;
  border-color: #e4e7ed;
}

.btn--default:hover:not(:disabled) {
  background-color: #ecf5ff;
  border-color: #c0c4cc;
}

.btn--default:active:not(:disabled) {
  transform: scale(0.97);
}

/* 主要按钮 */
.btn--primary {
  background-color: var(--primary-havy, #409eff);
  color: #ffffff;
}

/* 不被禁用的按钮才可以产生悬停效果  :not是伪类悬停选择器 */
.btn--primary:hover:not(:disabled) {
  background-color: var(--primary-hover, #66b1ff);
}

.btn--primary:active:not(:disabled) {
  transform: scale(0.97);
}

/* 危险按钮 */
.btn--danger {
  background-color: var(--danger, #f56c6c);
  color: #ffffff;
}

.btn--danger:hover:not(:disabled) {
  background-color: var(--danger-hover, #f78989);
}

.btn--danger:active:not(:disabled) {
  transform: scale(0.97);
}

/* link风格（可用于返回按钮或链接） */
.btn--link {
  background-color: #ffffff00;
  color: #565656;
  transition: ease-in-out 0.2s;
}

.btn--link:hover {
  color: #83868c;
}

/* pro 风格按钮（拟态/新拟物风格） */
.btn--pro {
  background-image: linear-gradient(154deg, #f4f6f8, #b6b9ba);
  box-shadow: 8px 8px 16px #b6b9ba, -8px -8px 16px #fafafd;
  border: none;
  color: #2c3e50;
}

.btn--pro:hover:not(:disabled) {
  background-image: linear-gradient(154deg, #eef2f5, #a5a9ac);
  box-shadow: 6px 6px 12px #b6b9ba, -6px -6px 12px #fafafd;
}

.btn--pro:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 4px 4px 8px #b6b9ba, -4px -4px 8px #fafafd;
}

/* ---------- 禁用 & 加载状态 ---------- */
.btn:disabled,
.btn--disabled {
  opacity: 0.65;
  cursor: not-allowed;
  pointer-events: none;
  /* 保证完全不可点击 */
}

/* loading 状态：显示旋转图标（纯 CSS） */
.btn__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
  position: relative;
}

.btn--loading .btn__content {
  padding-left: 20px;
}

.btn--loading .btn__content::before {
  content: '';
  position: absolute;
  left: 0;

  /* top将上边框下移到父元素中间,  translateY(-50%)加载框将自身向上移动自身50%空间*/
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  /* 四边都是实线，颜色与按钮文字颜色相同 */
  border: 2px solid currentColor;

  /* 把上边框变成透明，形成缺口 */
  border-top-color: transparent;

  border-radius: 50%;

  /* 匀速（linear），无限循环（infinite） */
  animation: btn-spin 0.8s linear infinite;
}

@keyframes btn-spin {
  to {
    /* 在这里把覆盖掉原本的translateY(-50%)的 transform定义的translateY(-50%)补回来 */
    transform: translateY(-50%) rotate(360deg);
  }
}

/* 不同尺寸下 loading 图标位置微调 */
.btn--small.btn--loading .btn__content {
  padding-left: 18px;
}

.btn--large.btn--loading .btn__content {
  padding-left: 24px;
}
</style>
