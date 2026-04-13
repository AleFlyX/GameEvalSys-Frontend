<template>
  <BaseCard shadow="hover">
    <template #header>
      <slot name="header"></slot>
    </template>
    <template #body>
      <div v-if="trendMapData.length" class="trend-chart">
        <div v-for="point in trendMapData" :key="point.label" class="trend-column">
          <div class="trend-bar-bg">
            <div class="trend-bar" :style="{ height: toBarHeight(point.count) }"></div>
          </div>
          <span class="trend-date">{{ point.label }}</span>
          <span class="trend-count">{{ point.count }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无趋势数据" />
    </template>
  </BaseCard>
</template>
<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';
import { computed } from 'vue';
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  trendTotalNumber: {
    type: String,
    default: ''
  },
  trendPoints: {
    type: Object,
    default: () => { }
  }
})

// 通过computed缓存，避免数据在异步获取过程中会因为空值调用失败
const trendMapData = computed(() => props.trendPoints)

// 趋势数据的最大值（用于柱状图高度比例计算）
const trendMax = computed(() => {
  if (!trendMapData.value.length) return 1;
  return Math.max(1, ...trendMapData.value.map((item) => Number(item.count) || 0));
});


/**
 * 根据计数计算柱状图高度（相对趋势最大值）
 * @param {number} count 当前日期的评分数量
 * @returns {string} 高度CSS值
 */
const toBarHeight = (count) => {
  const ratio = (Number(count) || 0) / trendMax.value;
  return `${Math.max(10, Math.round(ratio * 120))}px`;
};
</script>

<style scoped>
.trend-chart {
  height: 235px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
}

.trend-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.trend-bar-bg {
  width: 100%;
  max-width: 36px;
  height: 130px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f2f7fe, #e8f1fc);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}

.trend-bar {
  width: calc(100% - 8px);
  border-radius: 8px;
  background: linear-gradient(180deg, #6ab2ff 0%, #409eff 100%);
  transition: height 0.35s ease;
}

.trend-date {
  font-size: 12px;
  color: #7d8da2;
}

.trend-count {
  font-size: 12px;
  color: #1f2f46;
  font-weight: 600;
}
</style>
