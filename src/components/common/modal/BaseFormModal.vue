<template>
  <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <!-- 把这个事件往上抛给父组件，并把事件参数（$event，就是子组件触发事件时传的值
      （比如 BaseModal 关闭时传的 false））一起传过去； -->
    <!-- 等价写法：
      <BaseModal @update:visible="(val) => emit('update:visible', val)" />
    -->
    <template #layout>
      <div class="modal-layout">
        <div class="title">
          <h3>
            <slot name="title">
              <!-- 标题 -->
            </slot>
          </h3>
        </div>
        <div class="content">
          <slot name="form">
            <!-- 表单具体输入内容 -->
          </slot>
        </div>
        <div class="operation">
          <slot name="operations">
            <!-- 操作 -->
            <!-- button class种类:primary-btn,cancel-btn -->
          </slot>
        </div>
      </div>

    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
//我自己控制 $attrs 传给谁，不要vue自动帮我绑到根 DOM。
defineOptions({
  inheritAttrs: false
})

defineProps([]);

const emits = defineEmits([
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

</script>

<style scoped>
.modal-layout {
  padding: 5 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content {
  padding: 5px;
  max-height: 60vh;
  overflow-y: auto;
}

.operation {
  margin-top: auto;
  /* 保证操作区在底部 */
  display: flex;
  justify-content: flex-end;
}
</style>
