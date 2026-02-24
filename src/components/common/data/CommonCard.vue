<template>
  <div class="card">
    <div class="card-header">
      <!-- 修复了 slot 的 name 拼写 -->
      <slot name="header">
        <span class="card-title">{{ title }}</span>
        <el-icon class="card-icon">
          <component :is="icon"></component>
        </el-icon>
      </slot>
    </div>
    <div class="card-body">
      <slot name="chart">
        <div class="ring-chart" v-if="ringChart">
          <!-- 进度值建议通过 props 动态传入，这里暂保持原样 -->
          <div class="ring-progress" :style="{ '--progress': progress + '%' }"></div>
          <div class="ring-text">{{ progress }}%</div>
        </div>
      </slot>

      <div class="chart-desc">
        <slot name="description"></slot>
        <!-- 本周完成率较上周提升 <span class="positive">2.4%</span> -->
      </div>

    </div>
    <div class="card-footer">
      <slot name="footer">
        <!-- 点击查看详情 -->
      </slot>
    </div>
  </div>
</template>

<script setup>
// 建议添加 props 来接收进度值，例如：
const props = defineProps({
  icon: { type: String, default: "Management" },
  title: { type: String, default: "标题" },
  ringChart: { type: Boolean, default: false },
  progress: { type: Number, default: 66 }
})
</script>

<style scoped>
.card {
  /* 建议给卡片一个固定最小高度，避免内容塌陷 */
  min-height: 200px;
  position: relative;
  /* 为了 footer 的绝对定位 */
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(45, 49, 66, 0.08);
  transition: all 0.4s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 24px rgba(45, 49, 66, 0.12);
  filter: brightness(1.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(45, 49, 66, 0.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2D3142;
}

.card-icon {
  font-size: 1.2rem;
  color: #88D18A;
}

.card-body {
  /* 移除了 calc 计算，改为更灵活的 padding 处理，或者确保父级有高度 */
  /* 这里为了简单，直接让内容自然流动 */
}

.card-footer {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  font-size: 0.8rem;
  color: #9FA8A3;
  opacity: 0.8;
  text-align: right;
}

/* 环形进度图 */
.ring-chart {
  position: relative;
  width: 180px;
  /* 固定宽度 */
  height: 180px;
  /* 固定高度 */
  margin: 0 auto;
}

.ring-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#88D18A var(--progress), rgba(45, 49, 66, 0.1) 0);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.ring-progress::after {
  content: '';
  position: absolute;
  width: 85%;
  height: 85%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
}

.ring-text {
  position: absolute;
  /* 核心修复：使用 left/top 50% 配合 transform 居中 */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 2rem;
  font-weight: 500;
  color: #2D3142;
  /* 防止数字之间有不必要的空格 */
  white-space: nowrap;
}

.chart-desc {
  text-align: center;
  margin-top: 1.5rem;
  /* 稍微增加间距 */
  font-size: 0.9rem;
  color: #6B7280;
}

.positive {
  color: #88D18A;
  font-weight: 500;
}
</style>
