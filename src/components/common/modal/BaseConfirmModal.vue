<template>
  <Teleport to="body">
    <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
      <template #layout>
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
            <button v-if="showConfirmButton" class="primary-btn" @click="handleConfirm">确认</button>
            <button v-if="showCancelButton" class="cancel-btn" @click="handleCancel">取消</button>
          </slot>
        </div>
      </template>
    </BaseModal>
  </Teleport>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
////我自己控制 $attrs 传给谁，不要vue自动帮我绑到根 DOM。
defineOptions({
  inheritAttrs: false
})

defineProps({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  showConfirmButton: { type: Boolean, default: true },
  showCancelButton: { type: Boolean, default: true }

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

<style scoped></style>
