<template>
  <Transition name="modal">
    <slot></slot>
    <!-- 为了过渡样式的css而封装一个基础transition样式组件 -->
  </Transition>
</template>

<style scoped>
/* 穿透scoped，作用到插槽内的所有按钮 */
:deep(.operation button) {
  /* 基础按钮样式 */
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

/* 取消按钮（默认样式，可通过class="cancel-btn"指定） */
:deep(.operation .cancel-btn) {
  background-color: #f5f7fa;
  color: #606266;
  border-color: #e4e7ed;
}

:deep(.operation .cancel-btn:hover) {
  background-color: #e8eaed;
  border-color: #dcdfe6;
}

/* 确认按钮（默认样式，可通过class="primary-btn"指定） */
:deep(.operation .primary-btn) {
  background-color: #409eff;
  color: #ffffff;
}

:deep(.operation .primary-btn:hover) {
  background-color: #66b1ff;
}

/* 危险按钮（删除，class="danger-btn"） */
:deep(.operation .danger-btn) {
  background-color: #f56c6c;
  color: #ffffff;
}

:deep(.operation .danger-btn:hover) {
  background-color: #f78989;
}

/* 禁用状态通用样式 */
:deep(.operation button:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}

:deep(.operation button:disabled:hover) {
  /* background-color: inherit;
  border-color: inherit; */
  /* 继承css属性会导致opacity=1 */
  opacity: 0.5;
  cursor: not-allowed;
}

/* 动画选择器 */
/* 进入/离开的初始状态 */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 进入/离开的结束状态 */
.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

/* 进入/离开的过渡过程 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

/* 内容层位移动画（修复选择器） */
.modal-enter-from .base-form {
  transform: translateY(40px);
  opacity: 0;
}

.modal-enter-to .base-form {
  transform: translateY(0);
  opacity: 1;
}

.modal-enter-active .base-form {
  transition: all 0.2s ease 0.1s;
}
</style>
