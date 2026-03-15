<template>
  <!-- 用 Teleport 把内容直接传送到 body 下 -->
  <Teleport to="body">
    <!-- 遮罩层 -->
    <Transition name="fade" appear>
      <div v-if="visible" class="my-message-box-mask" @click.self="handleCancel">
        <Transition name="zoom" appear>
          <div v-if="visible" class="my-message-box">
            <div class="my-message-box__header">{{ title }}</div>
            <div class="my-message-box__content">{{ content }}</div>
            <div class="my-message-box__footer">
              <button class="my-message-box__btn my-message-box__btn--cancel" @click="handleCancel">取消</button>
              <button class="my-message-box__btn my-message-box__btn--confirm" @click="handleConfirm">确定</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  title: { type: String, default: '提示' },
  content: { type: String, default: '确认执行此操作？' },
  visible: { type: Boolean, default: false }
})

// Emits
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 事件处理
const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
/* 样式保持不变 */
.my-message-box-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.my-message-box {
  background: white;
  border-radius: 8px;
  width: 420px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.my-message-box__header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.my-message-box__content {
  margin-bottom: 20px;
  color: #606266;
}

.my-message-box__footer {
  text-align: right;
}

.my-message-box__btn {
  margin-left: 10px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.my-message-box__btn--cancel {
  background: #fff;
  border: 1px solid #dcdfe6;
}

.my-message-box__btn--confirm {
  background: #409eff;
  color: white;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.3s;
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.8);
}
</style>
