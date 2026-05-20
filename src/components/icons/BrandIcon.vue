<template>
  <div class="brand-wrap">
    <span class="brand-mark" :style="iconStyle">GE</span>
    <span v-show="!isCollapsed" class="title">项目评分平台</span>
  </div>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val) => {
      const validSizes = ['small', 'medium', 'large'];
      if (!validSizes.includes(val)) {
        console.warn(`[BrandIcon组件] size属性值 "${val}" 不合法，仅支持 small/medium/large，已自动转为 medium`);
      }
      return true;
    }
  }
})

const sizeMap = {
  small: '24px',
  medium: '30px',
  large: '36px'
}

const brandMarkSize = computed(() => sizeMap[props.size] || sizeMap.medium);
const iconStyle = computed(() => ({
  width: brandMarkSize.value,
  height: brandMarkSize.value,
  fontSize: `calc(${brandMarkSize.value} / 2)`,
}))
</script>
<style scoped>
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
  background: linear-gradient(135deg, #0a84ff, #0a69d7);
  box-shadow: 0 8px 18px rgba(10, 132, 255, 0.35);
}
</style>
