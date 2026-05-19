<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-mask" :style="{ zIndex: maskZIndex }" @mousedown="handleMaskMousedown"
      @mouseup="handleMaskMouseup" @mouseleave="resetMaskState">
      <div v-if="visible" ref="modalContentRef" class="base-modal" :class="{ 'dark-modal': isDarkMode }"
        :style="modalContentStyles" @click.stop>
        <button v-if="showDefaultClose" type="button" class="default-close" aria-label="关闭弹窗" @click="closeModal">
          ×
        </button>

        <slot name="layout"></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref } from 'vue';

defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  minWidth: {
    type: [Number, String],
    default: 0
  },
  maxWidth: {
    type: [Number, String],
    default: 0
  },
  minHeight: {
    type: [Number, String],
    default: 0
  },
  maxHeight: {
    type: [Number, String],
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
    type: String,
    default: 'normal'
  },
  contentZindex: {
    type: String,
    default: 'normal'
  }
});

const emits = defineEmits(['update:visible']);

const isMaskDown = ref(false);
const modalContentRef = ref(null);

const zIndexMap = {
  low: { mask: 'var(--z-modal-mask-low, 2000)', content: 'var(--z-modal-content-low, 2001)' },
  normal: { mask: 'var(--z-modal-mask, 2000)', content: 'var(--z-modal-content, 2001)' },
  high: { mask: 'var(--z-modal-mask-high, 3000)', content: 'var(--z-modal-content-high, 3001)' }
};

const normalizeSize = (value, fallback) => {
  if (value === '' || value === 0 || value === '0' || value === null || value === undefined) return fallback;
  if (typeof value === 'number') return `${value}px`;
  return value;
};

const closeModal = () => {
  emits('update:visible', false);
  resetMaskState();
};

const resetMaskState = () => {
  isMaskDown.value = false;
};

const handleMaskMousedown = (e) => {
  if (!props.allowMaskClose) return;

  const contentDom = modalContentRef.value;
  if (contentDom && !contentDom.contains(e.target)) {
    isMaskDown.value = true;
  }
};

const handleMaskMouseup = (e) => {
  if (!props.allowMaskClose || !isMaskDown.value) {
    resetMaskState();
    return;
  }

  const contentDom = modalContentRef.value;
  if (contentDom && !contentDom.contains(e.target)) {
    closeModal();
  }
  resetMaskState();
};

const maskZIndex = computed(() => zIndexMap[props.modalZindex]?.mask || zIndexMap.normal.mask);

const modalContentStyles = computed(() => ({
  minWidth: props.width ? props.width : normalizeSize(props.minWidth, '420px'),
  maxWidth: props.width ? props.width : normalizeSize(props.maxWidth, '760px'),
  minHeight: props.height ? props.height : normalizeSize(props.minHeight, '120px'),
  maxHeight: props.height ? props.height : normalizeSize(props.maxHeight, '90vh'),
  zIndex: zIndexMap[props.contentZindex]?.content || zIndexMap.normal.content,
}));

const isDarkMode = computed(() => props.darkMode);
</script>

<style scoped>
:host,
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
  inset: 0;
  width: 100vw;
  height: 100vh;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.54));
  backdrop-filter: blur(8px);
  transition: opacity 0.28s ease;
}

.base-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: auto;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--border, rgba(223, 231, 243, 0.95));
  background: var(--card-bg, rgba(255, 255, 255, 0.98));
  box-shadow:
    0 28px 60px rgba(15, 23, 42, 0.18),
    0 8px 18px rgba(15, 23, 42, 0.08);
}

html[data-theme="dark"] .base-modal {
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.4),
    0 8px 18px rgba(0, 0, 0, 0.2);
}

.dark-modal {
  border-color: rgba(86, 98, 120, 0.7);
  background: rgba(33, 37, 46, 0.96);
  color: #f7f9fc;
}

.default-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--bg-secondary, rgba(148, 163, 184, 0.12));
  color: var(--text-secondary, #64748b);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.default-close:hover {
  background: rgba(47, 107, 255, 0.12);
  color: var(--primary, #2f6bff);
}

.dark-modal .default-close {
  color: rgba(255, 255, 255, 0.84);
  background: rgba(255, 255, 255, 0.08);
}

.dark-modal .default-close:hover {
  background: rgba(80, 160, 255, 0.18);
  color: #9ac2ff;
}

:deep(.operation) {
  padding: 18px 0 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border, rgba(230, 236, 244, 0.88));
}

:deep(.dark-modal .operation) {
  border-top-color: rgba(86, 98, 120, 0.4);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.28s ease;
}

.modal-enter-from .base-modal,
.modal-leave-to .base-modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

.modal-enter-to .base-modal,
.modal-leave-from .base-modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.modal-enter-active .base-modal,
.modal-leave-active .base-modal {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

@media (max-width: 768px) {
  .modal-mask {
    padding: 14px;
  }

  .base-modal {
    width: min(100%, 100vw - 28px);
    border-radius: 20px;
  }

  :deep(.operation) {
    flex-wrap: wrap;
  }
}
</style>
