<template>

  <Transition name="modal">
    <div class="modal-mask" @click="closeModal" v-if="visible"> <!-- 外层也用v-if控制，避免遮罩残留 -->
      <!-- 改用v-if，且依赖props传入的visible -->
      <div class="base-form" @click.stop v-if="visible">
        <button class="default-close" @click="closeModal">x</button>
        <div class="title">
          <h3>
            <slot name="title">
              <!-- 标题 -->
            </slot>
          </h3>
        </div>
        <div class="content">
          <p>
            <slot name="form">
              <!-- 表单具体输入内容 -->
            </slot>
          </p>
        </div>
        <div class="operation">
          <slot name="operations">
            <!-- 操作 -->
            <!-- button class种类:primary-btn,cancel-btn -->
          </slot>
        </div>
      </div>
    </div>
  </Transition>

</template>

<script setup>

const props = defineProps({
  // 接收父组件传入的显隐控制参数
  visible: {
    type: Boolean,
    required: true,
    default: false
  },

})

const emits = defineEmits([
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

// 关闭弹窗的方法（通知父组件更新状态）
const closeModal = () => {
  emits('update:visible', false)
  // emits('clickMaskToClose', true)
}

// 监听visible变化，确保动画执行完整
// watch(() => props.visible, (newVal) => {
//   if (!newVal) {
//     // 这里可以加一些动画结束后的清理逻辑（如果需要）
//   }
// })
</script>

<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  transition: opacity 0.3s ease;
}

.base-form {
  width: 400px;
  /* min-height: 200px; */
  padding: 15px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.default-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
  padding: 10px;
  font-size: 20px;
  border: none;
  outline: none;
  background: transparent;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.default-close:hover {
  color: #409eff;
}

.content {
  font-size: small;
  color: gray;
}

.operation {
  padding: 10px 5px;
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 15px;

}

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
