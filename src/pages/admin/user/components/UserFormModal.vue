<template>
  <div>
    <!-- Transition 组件包裹，Vue 实现过渡动画的标准方式 -->
    <Transition name="modal">
      <!-- 遮罩层：v-show 控制显隐（保留DOM，才能有过渡效果） -->
      <div class="modal-mask" v-show="props.visible" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>这是弹窗</h3>
          <slot name="test"></slot>
          <p>控制显隐</p>
          <form></form>
          <button @click="closeModal">关闭</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  // 控制弹窗显隐
  visible: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['close'])

const closeModal = () => {
  // console.log('modal close emit')
  emits('close')
}
</script>

<style scoped>
/* 遮罩层 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  /* 初始不可点击（隐藏时） */
  /* pointer-events: none; */
}

/* 弹窗内容基础样式 */
.modal-content {
  width: 400px;
  min-height: 200px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Transition 动画 */
/* Vue 内置的 <Transition> 会自动为元素添加 / 移除动画类名（如 modal-enter-from、modal-enter-to） */
/* 进入/离开的初始状态 */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 进入/离开的结束状态 */
.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  /* pointer-events: auto; */
  /* 显示时可点击 */
}

/* 进入/离开的过渡过程 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

/* 内容层额外位移动画（可选） */
.modal-enter-from .modal-content {
  transform: translateY(40px);
  opacity: 0;
}

.modal-enter-to .modal-content {
  transform: translateY(0);
  opacity: 1;
}

.modal-enter-active .modal-content {
  transition: all 0.2s ease 0.1s;
  /* 延迟一点，更自然 */
}
</style>
