<template>
  <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #layout>
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
    </template>
  </BaseModal>

</template>

<script setup>
import BaseModal from './BaseModal.vue'
////我自己控制 $attrs 传给谁，不要vue自动帮我绑到根 DOM。
defineOptions({
  inheritAttrs: false
})

defineProps({})

const emits = defineEmits([
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

</script>

<style scoped></style>
