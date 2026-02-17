<template>
  <BaseModal>
    <div class="modal-mask" @click="closeModal" v-if="visible"> <!-- 外层也用v-if控制，避免遮罩残留 -->
      <!-- 改用v-if，且依赖props传入的visible -->
      <div class="base-form" @click.stop v-if="visible">
        <button class="default-close" @click="closeModal">x</button>
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
    </div>


  </BaseModal>

</template>

<script setup>
import BaseModal from './BaseModal.vue';

const props = defineProps({
  // 接收父组件传入的显隐控制参数
  visible: {
    type: Boolean,
    required: true,
    default: false
  },

})

const emits = defineEmits([
  'update:visible' // 用于双向绑定，通知父组件更新显隐状态
])

// 关闭弹窗的方法（通知父组件更新状态）
const closeModal = () => {
  emits('update:visible', false)
  // emits('clickMaskToClose', true)
}

// 监听visible变化，确保动画执行完整
// watch(() => props.visible, (newVal) => {
//   if (!newVal) {
//     // 这里可以加一些动画结束后的清理逻辑（如果需要）
//   }
// })
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
