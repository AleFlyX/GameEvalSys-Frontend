<template>
  <div class="home-container">
    <!-- 页面标题 -->
    <h1 class="page-title">项目评分平台 · 数据概览</h1>

    <!-- 顶部核心指标卡片组 -->
    <div class="stat-cards-wrapper">
      <!-- 卡片1：总项目数 -->
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon indigo-icon"></div>
          <span class="growth-rate up">+12.5%</span>
        </div>
        <p class="stat-label">总项目数</p>
        <h3 class="stat-value">1,286</h3>
        <p class="stat-sub-label">累计提报项目</p>
        <div ref="miniChartRef1" class="mini-chart"></div>
      </div>

      <!-- 卡片2：新增评分 -->
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon emerald-icon"></div>
          <span class="growth-rate up">+8.2%</span>
        </div>
        <p class="stat-label">新增评分</p>
        <h3 class="stat-value">327</h3>
        <p class="stat-sub-label">本周新增评审</p>
        <div ref="miniChartRef2" class="mini-chart"></div>
      </div>

      <!-- 卡片3：平均项目得分 -->
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon amber-icon"></div>
          <span class="growth-rate up">+15.7%</span>
        </div>
        <p class="stat-label">平均项目得分</p>
        <h3 class="stat-value">4.86</h3>
        <p class="stat-sub-label">满分5分制</p>
        <div ref="miniChartRef3" class="mini-chart"></div>
      </div>

      <!-- 卡片4：项目驳回率 -->
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon rose-icon"></div>
          <span class="growth-rate down">-3.1%</span>
        </div>
        <p class="stat-label">项目驳回率</p>
        <h3 class="stat-value">18%</h3>
        <p class="stat-sub-label">评审驳回比例</p>
        <div ref="miniChartRef4" class="mini-chart"></div>
      </div>
    </div>

    <!-- 下方内容区 -->
    <div class="main-content-wrapper">
      <!-- 左侧：趋势分析图表 -->
      <div class="trend-card">
        <div class="trend-header">
          <div>
            <h2 class="trend-title">趋势分析</h2>
            <p class="trend-sub-title">过去30天的数据变化趋势</p>
          </div>
          <!-- Element Plus 按钮组切换 Tab -->
          <el-button-group class="tab-group">
            <el-button v-for="tab in trendTabs" :key="tab.key"
              :type="activeTrendTab === tab.key ? 'primary' : 'default'" @click="activeTrendTab = tab.key" size="small">
              {{ tab.label }}
            </el-button>
          </el-button-group>
        </div>
        <div ref="trendChartRef" class="trend-chart"></div>
      </div>

      <!-- 右侧：洞察&建议 -->
      <div class="side-cards-wrapper">
        <!-- 关键洞察卡片 -->
        <div class="side-card">
          <div class="side-card-header">
            <div class="side-icon emerald-bg"></div>
            <h3 class="side-card-title">关键洞察</h3>
          </div>
          <ul class="insight-list">
            <li class="insight-item">
              <span class="dot"></span>
              <span>项目提交量在过去一周增长了12.5%，主要来源于企业端用户新增</span>
            </li>
            <li class="insight-item">
              <span class="dot"></span>
              <span>项目评分通过率提升至82%，显示项目整体质量显著提升</span>
            </li>
            <li class="insight-item">
              <span class="dot"></span>
              <span>平均评审时长缩短至1.2个工作日，评审效率大幅提高</span>
            </li>
          </ul>
        </div>

        <!-- 优化建议卡片 -->
        <div class="side-card">
          <div class="side-card-header">
            <div class="side-icon indigo-bg"></div>
            <h3 class="side-card-title">优化建议</h3>
          </div>
          <ul class="suggestion-list">
            <li class="suggestion-item">
              <span class="dot indigo-dot"></span>
              <span>继续优化企业端项目提交流程，降低操作门槛</span>
            </li>
            <li class="suggestion-item">
              <span class="dot indigo-dot"></span>
              <span>加强对低分项目的指导培训，提升整体项目质量</span>
            </li>
            <li class="suggestion-item">
              <span class="dot indigo-dot"></span>
              <span>分析高评分项目特征，制定标准化的项目提报规范</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElButton, ElButtonGroup } from 'element-plus'
import { ElMessage } from 'element-plus'

// -------------------------- 1. 响应式数据定义 --------------------------
// 图表 DOM 引用
const trendChartRef = ref(null)
const miniChartRef1 = ref(null)
const miniChartRef2 = ref(null)
const miniChartRef3 = ref(null)
const miniChartRef4 = ref(null)

// 图表实例
let trendChart = null
let miniChart1 = null
let miniChart2 = null
let miniChart3 = null
let miniChart4 = null
let echartsLib = null

// 迷你图表数据
const miniChartData = {
  data1: [120, 135, 128, 142, 150, 168, 180],
  data2: [30, 35, 32, 40, 45, 42, 52],
  data3: [4.2, 4.3, 4.25, 4.4, 4.5, 4.7, 4.86],
  data4: [25, 23, 24, 22, 20, 21, 18]
}

// 趋势图 Tab 配置
const trendTabs = ref([
  { key: 'project', label: '项目数' },
  { key: 'score', label: '评分' },
  { key: 'rate', label: '通过率' }
])
const activeTrendTab = ref('project')

// -------------------------- 2. 图表配置函数 --------------------------
// 迷你图表配置生成
const getMiniChartOption = (data, color) => ({
  grid: { left: 0, right: 0, top: 0, bottom: 0 },
  xAxis: { type: 'category', show: false, data: Array.from({ length: data.length }, (_, i) => i) },
  yAxis: { type: 'value', show: false },
  series: [{
    data,
    type: 'line',
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 2, color },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: `${color}20` },
          { offset: 1, color: `${color}00` }
        ]
      }
    }
  }]
})

// 趋势图配置（响应式）
const trendChartOption = computed(() => {
  const dateList = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)

  const dataMap = {
    project: [500, 800, 750, 1200, 1100, 1500, 1400, 1800, 2200, 2000, 2500, 2400, 2800, 3000, 2800, 3200, 3500, 3300, 3800, 4000, 3800, 4200, 4500, 4300, 4800, 5000, 4800, 6000, 7200, 8000],
    score: [3.2, 3.3, 3.5, 3.4, 3.6, 3.8, 3.7, 3.9, 4.0, 4.1, 4.0, 4.2, 4.3, 4.2, 4.4, 4.5, 4.4, 4.6, 4.7, 4.6, 4.7, 4.8, 4.75, 4.8, 4.82, 4.83, 4.84, 4.85, 4.86, 4.88],
    rate: [50, 52, 55, 54, 58, 60, 62, 61, 65, 66, 68, 67, 70, 72, 71, 73, 75, 74, 76, 78, 77, 79, 80, 81, 80, 81, 82, 82, 82, 83]
  }

  const colorMap = {
    project: '#6366f1',
    score: '#10b981',
    rate: '#f59e0b'
  }

  return {
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateList,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 10 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#f3f4f6',
      borderWidth: 1,
      textStyle: { color: '#1f2937' },
      padding: [8, 12]
    },
    series: [{
      data: dataMap[activeTrendTab.value],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: colorMap[activeTrendTab.value] },
      lineStyle: { width: 2, color: colorMap[activeTrendTab.value] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${colorMap[activeTrendTab.value]}20` },
            { offset: 1, color: `${colorMap[activeTrendTab.value]}00` }
          ]
        }
      }
    }]
  }
})

const ensureEcharts = async () => {
  if (echartsLib) {
    return echartsLib
  }

  try {
    const module = await import('echarts')
    echartsLib = module
    return echartsLib
  } catch (error) {
    ElMessage.error('统计图表依赖 echarts，当前项目尚未安装该依赖')
    console.error('加载 echarts 失败:', error)
    return null
  }
}

// -------------------------- 3. 初始化与销毁 --------------------------
// 初始化所有图表
const initCharts = async () => {
  const echarts = await ensureEcharts()
  if (!echarts) {
    return
  }

  // 1. 初始化趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(trendChartOption.value)
  }

  // 2. 初始化迷你图
  const miniChartConfigs = [
    { ref: miniChartRef1, data: miniChartData.data1, color: '#6366f1' },
    { ref: miniChartRef2, data: miniChartData.data2, color: '#10b981' },
    { ref: miniChartRef3, data: miniChartData.data3, color: '#f59e0b' },
    { ref: miniChartRef4, data: miniChartData.data4, color: '#f43f5e' }
  ]

  miniChartConfigs.forEach((config, index) => {
    if (config.ref.value) {
      const chart = echarts.init(config.ref.value)
      chart.setOption(getMiniChartOption(config.data, config.color))
      // 保存实例
      if (index === 0) miniChart1 = chart
      if (index === 1) miniChart2 = chart
      if (index === 2) miniChart3 = chart
      if (index === 3) miniChart4 = chart
    }
  })
}

// 监听 Tab 切换更新趋势图
watch(activeTrendTab, () => {
  if (trendChart) {
    trendChart.setOption(trendChartOption.value)
  }
})

// 窗口大小变化时重绘图表
const handleResize = () => {
  trendChart && trendChart.resize()
  miniChart1 && miniChart1.resize()
  miniChart2 && miniChart2.resize()
  miniChart3 && miniChart3.resize()
  miniChart4 && miniChart4.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
})

// 清理事件监听
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* -------------------------- 全局布局与基础样式 -------------------------- */
.home-container {
  /* min-height: 100vh; */
  /* overflow-y: scroll; */
  background-color: #f9fafb;
  padding: 32px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 32px 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* -------------------------- 顶部指标卡片 -------------------------- */
.stat-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 32px auto;
}

@media (min-width: 640px) {
  .stat-cards-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stat-cards-wrapper {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

/* 将原有的 .stat-icon 及相关颜色类替换为以下代码 */
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  /* 减轻内陷效果：减小阴影偏移、模糊半径和透明度 */
  box-shadow:
    inset 1px 1px 3px rgba(0, 0, 0, 0.08),
    inset -1px -1px 3px rgba(255, 255, 255, 0.6);
}

/* 颜色类：背景渐变过渡也更柔和 */
.indigo-icon {
  background: linear-gradient(145deg, #cbd3ff, #e6edff);
}

.emerald-icon {
  background: linear-gradient(145deg, #c0f5dd, #d1fae5);
}

.amber-icon {
  background: linear-gradient(145deg, #fef0b5, #fef3c7);
}

.rose-icon {
  background: linear-gradient(145deg, #ffd9de, #ffe4e6);
}

.growth-rate {
  font-size: 0.875rem;
  font-weight: 600;
}

.growth-rate.up {
  color: #10b981;
}

.growth-rate.down {
  color: #f43f5e;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.stat-sub-label {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0 0 16px 0;
}

.mini-chart {
  width: 100%;
  height: 40px;
}

/* -------------------------- 下方主内容区 -------------------------- */
.main-content-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .main-content-wrapper {
    grid-template-columns: 2fr 1fr;
  }
}

/* 趋势分析卡片 */
.trend-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
}

.trend-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

@media (min-width: 640px) {
  .trend-header {
    flex-direction: row;
    align-items: center;
  }
}

.trend-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.trend-sub-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.trend-chart {
  width: 100%;
  height: 400px;
}

/* 右侧卡片容器 */
.side-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.side-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
}

.side-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.side-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.emerald-bg {
  background-color: #d1fae5;
}

.indigo-bg {
  background-color: #e0e7ff;
}

.side-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* 列表样式 */
.insight-list,
.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-item,
.suggestion-item {
  display: flex;
  gap: 12px;
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.6;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #9ca3af;
  margin-top: 8px;
  flex-shrink: 0;
}

.indigo-dot {
  background-color: #6366f1;
}
</style>
