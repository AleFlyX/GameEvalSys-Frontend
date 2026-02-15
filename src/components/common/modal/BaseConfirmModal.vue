<template>

  <Transition name="modal">
    <div class="modal-mask" @click="closeModal" v-if="visible"> <!-- 外层也用v-if控制，避免遮罩残留 -->
      <!-- 改用v-if，且依赖props传入的visible -->
      <div class="confirm-delete" @click.stop v-if="visible">
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
            <slot name="content">
              <!-- 提示小字 -->
            </slot>
          </p>
        </div>
        <div class="operation">
          <slot name="operations">
            <!-- 操作 -->
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
  'clickMaskToClose',
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

// 关闭弹窗的方法（通知父组件更新状态）
const closeModal = () => {
  emits('update:visible', false)
  emits('clickMaskToClose', true)
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
  /* 给个默认值，避免var未定义 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  /* 遮罩也加过渡动画，更自然 */
  transition: opacity 0.3s ease;
}

.confirm-delete {
  width: 400px;
  min-height: 200px;
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
  /* 加鼠标指针，提升体验 */
}

.default-close:hover {
  color: #409eff;
  /* 给个默认主色，避免var未定义 */
}

/* 修复动画选择器：原.modal-content不存在，改为.confirm-delete */
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
.modal-enter-from .confirm-delete {
  transform: translateY(40px);
  opacity: 0;
}

.modal-enter-to .confirm-delete {
  transform: translateY(0);
  opacity: 1;
}

.modal-enter-active .confirm-delete {
  transition: all 0.2s ease 0.1s;
  /* 延迟一点，更自然 */
}
</style>
