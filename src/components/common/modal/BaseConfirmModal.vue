<template>
  <Teleport to="body">
    <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
      <template #layout>
        <div class="confirm-layout">
          <div class="title">
            <h3>
              <slot name="title">
                <!-- 标题 -->
                {{ title }}
              </slot>
            </h3>
          </div>
          <div class="content">
            <p>
              <slot name="content">
                <!-- 提示小字 -->
                {{ content }}
              </slot>
            </p>
          </div>
          <div class="operation">
            <slot name="operations">
              <!-- 操作 -->
              <MyBtn v-if="showConfirmButton" :type="type" @click="handleConfirm" :disabled="disabled">
                {{ confirmButtonText }}
              </MyBtn>
              <MyBtn v-if="showCancelButton" type="default" @click="handleCancel" :disabled="disabled">
                {{ cancelButtonText }}
              </MyBtn>
            </slot>
          </div>
        </div>
      </template>
    </BaseModal>
  </Teleport>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import MyBtn from '@/components/common/form/MyBtn.vue'
////我自己控制 $attrs 传给谁，不要vue自动帮我绑到根 DOM。
defineOptions({
  inheritAttrs: false
})

defineProps({
  type: { type: String, default: 'primary' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  showConfirmButton: { type: Boolean, default: true },
  showCancelButton: { type: Boolean, default: true },
  confirmButtonText: { type: String, default: '确认' },
  cancelButtonText: { type: String, default: '取消' },
  disabled: { type: Boolean, default: false } // 禁用按钮
})

const emits = defineEmits([
  'update:visible', // 用于双向绑定，通知父组件更新显隐状态
  'cancel',
  'confirm'
])

// 事件处理
const handleConfirm = () => {
  emits('confirm')
  emits('update:visible', false)
}

const handleCancel = () => {
  emits('cancel')
  emits('update:visible', false)
}
</script>

<style scoped>
.confirm-layout {
  padding: 32px 32px 24px;
}

.title {
  margin-bottom: 12px;
}

.title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  line-height: 1.4;
}

.content {
  margin-bottom: 32px;
}

.content p {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary, #64748b);
  line-height: 1.6;
}

.operation {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border, #e2e8f0);
}

html[data-theme="dark"] .title h3 {
  color: var(--text-primary, #f1f5f9);
}

html[data-theme="dark"] .content p {
  color: var(--text-secondary, #94a3b8);
}
</style>
