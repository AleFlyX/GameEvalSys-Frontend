<template>
  <div class="brand-wrap">
    <span class="brand-mark">GE</span>
    <span v-show="!isCollapsed" class="title">项目评分平台</span>
  </div>
</template>
<script setup>
defineProps({
  isCollapsed: {
    type: Boolean,
    required: true
  }
})

</script>
<style scoped>
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
  background: linear-gradient(135deg, #0a84ff, #0a69d7);
  box-shadow: 0 8px 18px rgba(10, 132, 255, 0.35);
}
</style>
