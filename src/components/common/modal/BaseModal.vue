<template>
  <Transition name="modal">
    <div class="modal-mask" @mousedown="handleMaskMousedown" @mouseup="handleMaskMouseup" @mouseleave="resetMaskState"
      v-if="visible" :style="{
        'z-index': props.modalZindex === 'low' ? 'var(--z-modal-mask-low, 2000)' :
          (props.modalZindex === 'high' ? 'var(--z-modal-mask-high, 3000)' : 'var(--z-modal-mask, 2000)')
      }">
      <!-- 外层也用v-if控制，避免遮罩残留 -->
      <!-- 用v-if，且依赖props传入的visible -->
      <div class="base-modal" ref="modalContentRef" @click.stop v-if="visible" :style="modalContentStyles"
        :class="{ 'dark-modal': isDarkMode }">
        <button class="default-close" @click="closeModal" v-if="showDefaultClose">x</button>
        <slot name="layout"></slot>
      </div>
    </div>
    <!-- 为了过渡样式的css而封装一个基础transition样式组件 -->
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
//我自己控制 $attrs 传给谁，不要vue自动帮我绑到根 DOM。
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  // 接收父组件传入的显隐控制参数
  visible: {
    type: Boolean,
    default: false
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  width: {  // width优先级比max/min-width高
    type: [String],
    default: ''
  },
  height: { // height 同理
    type: [String],
    default: ''
  },
  minWidth: {
    type: Number,
    default: 0
  },
  maxWidth: {
    type: Number,
    default: 0
  },

  minHeight: {
    type: Number,
    default: 0
  },
  maxHeight: {
    type: Number,
    default: 0
  },

  showDefaultClose: {
    type: Boolean,
    default: true
  },
  allowMaskClose: {
    type: Boolean,
    default: true
  },
  modalZindex: {
    type: String,// low, normal, high
    default: 'normal'
  },
  contentZindex: {
    type: String,// low, normal, high
    default: 'normal'
  }
})

const emits = defineEmits([
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

// 关闭弹窗的方法（通知父组件更新状态）
const closeModal = () => {
  emits('update:visible', false)
  resetMaskState() // 关闭后重置状态，避免残留
}

// 标记是否在遮罩层按下鼠标（解决拖拽穿过的问题）
const isMaskDown = ref(false)
const modalContentRef = ref(null)

// 重置遮罩层鼠标状态
const resetMaskState = () => {
  isMaskDown.value = false
}

// 鼠标在遮罩层按下时：判断是否点在遮罩层空白处
const handleMaskMousedown = (e) => {
  if (!props.allowMaskClose) return

  const contentDom = modalContentRef.value
  // 只有点击遮罩层空白处（非内容区），才标记为“按下”
  if (contentDom && !contentDom.contains(e.target)) {
    isMaskDown.value = true
  }
}

// 鼠标松开时：只有“按下在遮罩层+松开也在遮罩层”才关闭
const handleMaskMouseup = (e) => {
  if (!props.allowMaskClose || !isMaskDown.value) {
    resetMaskState()
    return
  }

  const contentDom = modalContentRef.value
  // 二次确认：松开时仍在遮罩层空白处
  if (contentDom && !contentDom.contains(e.target)) {
    closeModal()
  }
  resetMaskState()
}

const modalContentStyles = computed(() => {
  return {
    'min-width': props.width ? props.width : (props.minWidth ? props.minWidth : '400px'),
    'max-width': props.width ? props.width : (props.maxWidth ? props.maxWidth : '700px'),
    'min-height': props.height ? props.height : (props.minHeight ? props.minHeight : '100px'),
    'max-height': props.height ? props.height : (props.maxHeight ? props.maxHeight : '90vh'),
    'z-index': props.contentZindex === 'low' ? 'var(--z-modal-content-low, 2001)' :
      (props.contentZindex === 'high' ? 'var(--z-modal-content-high, 3001)' : 'var(--z-modal-content, 2001)')
  }
})
const isDarkMode = computed(() => props.darkMode)

// (可扩展)监听visible变化，确保动画执行完整
// watch(() => props.visible, (newVal) => {
//   if (!newVal) {
//     // 这里可以加一些动画结束后的清理逻辑
//   }
// })
</script>

<style scoped>
* {
  box-sizing: border-box;
  --z-modal-mask-low: 2000;
  --z-modal-mask: 2000;
  --z-modal-mask-high: 3000;
  --z-modal-content-low: 2001;
  --z-modal-content: 2001;
  --z-modal-content-high: 3001;
}

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
  z-index: var(--z-modal-mask, 2000);
  transition: opacity 0.3s ease;
}

.base-modal {
  padding: 15px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: var(--z-modal-content, 2001);
}

.dark-modal {
  background: #272729;
  color: white;
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

.dark-modal .default-close {
  color: white;
}

.default-close:hover {
  color: #409eff;
}

:deep(.operation) {
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

/* 警告按钮 */
:deep(.operation .warning-btn) {
  /* background-color: var(--warning); */
  background-color: #ea9c00;
  color: #ffffff;
}

:deep(.operation .warning-btn:hover) {
  /* background-color: var(--warning-light); */
  background-color: #ffd788;

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
.modal-enter-from .base-modal {
  transform: translateY(40px);
  opacity: 0;
}

.modal-enter-to .base-modal {
  transform: translateY(0);
  opacity: 1;
}

.modal-enter-active .base-modal {
  transition: all 0.2s ease 0.1s;
}
</style>
