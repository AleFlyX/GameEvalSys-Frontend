<template>
  <div class="modal-mask" @click="closeModal">
    <div class="confirm-delete" @click.stop>
      <div class="title">
        <h2>{{ props.title + '用户' + props.data.id + ' ' + props.data.name }}</h2>
      </div>
      <div class="content">
        <p>{{ props.title }}</p>
      </div>
      <div class="operation">
        <button @click="confirmModal">确认</button>
        <button @click="closeModal">取消</button>
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
  data: {
    type: Object,
    default: () => {
      return {
        id: '',
        name: ''
      }
    }
  }
})

const emits = defineEmits([
  'confirm-delete',
  'close'
])

const confirmModal = () => {
  emits('confirm-delete', true)
}
const closeModal = () => {
  emits('close', true)
}
</script>
<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: var(--modal-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.confirm-delete {
  width: 400px;
  min-height: 200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
