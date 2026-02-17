<template>
  <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <!-- 把这个事件往上抛给父组件，并把事件参数（$event，就是子组件触发事件时传的值
      （比如 BaseModal 关闭时传的 false））一起传过去； -->
    <!-- 等价写法：
      <BaseModal @update:visible="(val) => emit('update:visible', val)" />
    -->
    <template #layout>
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
  z-index: 999;
  transition: opacity 0.3s ease;
}

.base-form {
  width: 400px;
  /* min-height: 200px; */
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
}

.default-close:hover {
  color: #409eff;
}

.content {
  font-size: small;
  color: gray;
}

.operation {
  padding: 10px 5px;
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 15px;

}
</style>
