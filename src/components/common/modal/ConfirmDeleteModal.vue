<template>
  <div class="modal-mask">
    <div class="confirm-delete">
      <div class="title">
        <h2>是否删除？</h2>
      </div>
      <div class="content">
        <p>删除后无法恢复</p>
      </div>
      <div class="operation">
        <button>确认</button>
        <button>取消</button>
      </div>
    </div>
  </div>

</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '确认删除?'
  },
  content: {
    type: String,
    default: '删除后无法恢复'
  },
})
const emits = defineEmits([
  'confirm-delete',
  'cancel'
])

</script>
<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: var(--modal-background);
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.confirm-delete {
  display: flex;
  flex-direction: column;

}
</style>
