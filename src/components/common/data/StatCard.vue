<template>
  <article class="stat-card" :style="customCardsStyle">
    <div class="stat-head stat-card-header">
      <div class="stat-icon-wrap" :style="iconWrapStyle">
        <slot name="icon">
          <el-icon class="stat-icon" :style="iconStyle">
            <component :is="resolvedIcon" />
          </el-icon>
        </slot>
      </div>
      <span v-if="label && labelPlacement === 'header'" class="stat-label">
        {{ label }}
      </span>
      <div v-if="$slots['head-extra']" class="stat-head-extra">
        <slot name="head-extra"></slot>
      </div>
    </div>
    <p v-if="label && labelPlacement === 'body'" class="stat-label">
      {{ label }}
    </p>
    <p v-if="value !== '' && value !== null" class="stat-value">{{ value }}</p>
    <p v-if="sub" class="stat-sub stat-sub-label">{{ sub }}</p>
    <slot name="footer"></slot>
  </article>
</template>

<script setup>
import { computed } from 'vue';

import { getElementIcon } from '@/utils/elementIcons';

const props = defineProps({
  width: { type: [String, Number], default: "" },
  height: { type: [String, Number], default: "100%" },
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' }, // 主要数据
  sub: { type: String, default: '' }, // 底部内容
  icon: { type: [String, Object, Function], default: '' },// 可传入字符串来使用el的icon，或传入render函数
  iconColor: { type: String, default: '#409eff' },
  iconBg: { type: String, default: '#ecf5ff' },
  labelPlacement: { type: String, default: 'header' },
  iconSize: { type: [Number, String], default: 34 },
  iconRadius: { type: [Number, String], default: 10 },
});

const resolvedIcon = computed(() => {
  if (!props.icon) return getElementIcon('User');
  if (typeof props.icon === 'string') return getElementIcon(props.icon);
  return props.icon;
});

const iconWrapStyle = computed(() => ({
  background: props.iconBg,
  width: typeof props.iconSize === 'number' ? `${props.iconSize}px` : props.iconSize,
  height: typeof props.iconSize === 'number' ? `${props.iconSize}px` : props.iconSize,
  borderRadius: typeof props.iconRadius === 'number' ? `${props.iconRadius}px` : props.iconRadius,
}));

const iconStyle = computed(() => ({
  color: props.iconColor,
}));

const customCardsStyle = computed(() => {
  if (props.width && props.height) {
    return {
      'width': props.width,
      'height': props.height,
    }
  }
  return {}
});
console.log(customCardsStyle.value)
</script>

<style scoped>
.stat-card {
  border-radius: var(--stat-card-radius, 16px);
  padding: var(--stat-card-padding, 18px);
  background: var(--stat-card-bg, rgba(255, 255, 255, 0.82));
  box-shadow: var(--stat-card-shadow, 0 10px 24px rgba(31, 47, 70, 0.08));
  backdrop-filter: blur(10px);
  animation: fadeUp 0.5s ease both;
  transition: var(--stat-card-transition, all 0.2s ease);
}

.stat-card:hover {
  transform: var(--stat-card-hover-transform, translateY(0));
  box-shadow: var(--stat-card-hover-shadow, var(--stat-card-shadow, 0 10px 24px rgba(31, 47, 70, 0.08)));
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--stat-head-gap, 0);
}

.stat-head-extra {
  margin-left: auto;
}

.stat-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  font-size: 18px;
}

.stat-label {
  font-size: var(--stat-label-size, 13px);
  color: var(--stat-label-color, #66758a);
  font-weight: var(--stat-label-weight, 400);
  margin: var(--stat-label-margin, 0);
}

.stat-value {
  margin: var(--stat-value-margin, 16px 0 4px);
  font-size: var(--stat-value-size, 34px);
  font-weight: var(--stat-value-weight, 700);
  color: var(--stat-value-color, #1f2f46);
  line-height: 1;
}

.stat-sub {
  margin: var(--stat-sub-margin, 0);
  font-size: var(--stat-sub-size, 12px);
  color: var(--stat-sub-color, #9aa8bb);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
