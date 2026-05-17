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
    default: '',
  },
  size: {
    type: String,
    default: 'medium',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['click']);

const handleClick = (e) => {
  if (props.disabled || props.loading) return;
  emits('click', e);
};
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #f8fafc;
  color: #54657f;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(47, 107, 255, 0.16);
}

.btn--small {
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
}

.btn--medium {
  min-height: 40px;
  padding: 0 18px;
  font-size: 14px;
}

.btn--large {
  min-height: 46px;
  padding: 0 24px;
  font-size: 15px;
}

.btn--default {
  background-color: #f8fafc;
  color: #54657f;
  border-color: #dbe4f0;
}

.btn--default:hover:not(:disabled) {
  background-color: #eef4fb;
  border-color: #c9d7e8;
  transform: translateY(-1px);
}

.btn--primary {
  background: linear-gradient(135deg, var(--primary-havy, #2f6bff) 0%, #20b7c7 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(47, 107, 255, 0.18);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 14px 28px rgba(47, 107, 255, 0.24);
}

.btn--danger {
  background: linear-gradient(135deg, var(--danger, #ef6b6b) 0%, #f28b82 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(239, 107, 107, 0.18);
}

.btn--danger:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.btn--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #f6b73c 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(245, 158, 11, 0.18);
}

.btn--warning:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.btn--link {
  min-height: auto;
  padding: 0;
  border: none;
  background: transparent;
  color: #2f6bff;
  box-shadow: none;
}

.btn--link:hover:not(:disabled) {
  color: #1f57df;
}

.btn--pro {
  background: linear-gradient(180deg, #ffffff 0%, #eef3fb 100%);
  color: #1f2a44;
  border-color: #d8e2ef;
  box-shadow: 0 12px 26px rgba(31, 42, 68, 0.08);
}

.btn--pro:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(31, 42, 68, 0.12);
}

.btn:disabled,
.btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}

.btn__content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.btn--loading .btn__content {
  padding-left: 20px;
}

.btn--loading .btn__content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.btn--small.btn--loading .btn__content {
  padding-left: 18px;
}

.btn--large.btn--loading .btn__content {
  padding-left: 24px;
}
</style>
