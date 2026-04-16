<template>
  <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <!-- 把这个事件往上抛给父组件，并把事件参数（$event，就是子组件触发事件时传的值
      （比如 BaseModal 关闭时传的 false））一起传过去； -->
    <!-- 等价写法：
      <BaseModal @update:visible="(val) => emit('update:visible', val)" />
    -->
    <template #layout>
      <header>
        <h3>
          <slot name="header">
            <!-- 标题 -->
          </slot>
        </h3>
      </header>

      <body>
        <slot name="body">

        </slot>
      </body>
      <div class="operation">
        <slot name="footer">

        </slot>
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

defineEmits([
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

</script>

<style scoped>
body {
  padding: 5px;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
