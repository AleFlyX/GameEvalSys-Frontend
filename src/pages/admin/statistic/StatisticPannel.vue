<template>
  <div class="home-container">
    <!-- 页面标题 -->
    <h1 class="page-title">项目评分平台 · 数据概览</h1>

    <!-- 顶部核心指标卡片组 -->
    <div class="stat-cards-wrapper">
      <!-- 卡片1：总项目数 -->
      <StatCard class="stat-card--metric" :label="`总项目数 ${loading ? '(加载中...)' : ''}`"
        :value="platformStats.totalProjects.toString()" sub="累计提报项目" label-placement="body" icon-bg="transparent"
        :icon-size="40" :icon-radius="12">
        <template #icon>
          <div class="stat-icon indigo-icon">
            <el-icon color="#6366f1" size="20">
              <component :is="getElementIcon('ChatSquare')"></component>
            </el-icon>
          </div>
        </template>
        <template #head-extra>
          <!-- <span class="growth-rate up">+Nan%</span> -->
        </template>
      </StatCard>

      <!-- 卡片2：新增评分 -->
      <StatCard class="stat-card--metric" :label="`新增评分 ${loading ? '(加载中...)' : ''}`"
        :value="platformStats.totalScores.toString()" sub="本周新增评审" label-placement="body" icon-bg="transparent"
        :icon-size="40" :icon-radius="12">
        <template #icon>
          <div class="stat-icon emerald-icon">
            <el-icon color="#10b981" size="20">
              <component :is="getElementIcon('Star')"></component>
            </el-icon>
          </div>
        </template>
        <template #head-extra>
          <!-- <span class="growth-rate up">+Nan%</span> -->
        </template>
      </StatCard>

      <!-- 卡片3：平均项目得分 -->
      <StatCard class="stat-card--metric" label="平均项目得分" :value="platformStats.averageScore.toFixed(2)" sub="满分由打分标准决定"
        label-placement="body" icon-bg="transparent" :icon-size="40" :icon-radius="12">
        <template #icon>
          <div class="stat-icon amber-icon">
            <el-icon color="#f59e0b" size="20">
              <component :is="getElementIcon('DataAnalysis')"></component>
            </el-icon>
          </div>
        </template>
        <template #head-extra>
          <!-- <span class="growth-rate up">+Nan%</span> -->
        </template>
      </StatCard>
    </div>

    <!-- 下方内容区 -->
    <div class="main-content-wrapper">
      <!-- 左侧：数据趋势图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">实时数据概览</h2>
          <p class="chart-subtitle">项目数和评分数的实时统计</p>
        </div>
        <div ref="trendsChartRef" class="trends-chart"></div>
      </div>

      <!-- 右侧：卡片堆叠 -->
      <!-- <div class="side-wrapper">

        <div class="summary-card insight-card">
          <div class="card-header">
            <div class="card-icon emerald-bg"></div>
            <h3 class="card-title">关键洞察</h3>
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


        <div class="summary-card suggestion-card">
          <div class="card-header">
            <div class="card-icon indigo-bg"></div>
            <h3 class="card-title">优化建议</h3>
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
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import StatCard from '@/components/common/data/StatCard.vue'
import { getPlatformStatistics } from '@/api/statistic'
import { getElementIcon } from '@/utils/elementIcons';
// -------------------------- 1. 响应式数据定义 --------------------------
// 图表 DOM 引用
const trendsChartRef = ref(null)

// 图表实例
let trendsChart = null
let echartsLib = null

// 平台统计数据
const platformStats = ref({
  totalProjects: 0,
  totalScores: 0,
  averageScore: 0,
  dates: [],
  projectTrend: [],
  scoreTrend: [],
  averageScoreTrend: []
})

const loading = ref(false)

// -------------------------- 2. 图表配置函数 --------------------------
// 趋势图配置（响应式）
const trendsChartOption = computed(() => {
  // 从API响应中获取日期，格式化为"月-日"
  const dateList = platformStats.value.dates.map(date => {
    const d = new Date(date)
    return `${d.getMonth() + 1}-${d.getDate()}`
  })

  // 使用API返回的真实数据
  const projectsData = platformStats.value.projectTrend
  const scoresData = platformStats.value.scoreTrend

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
    yAxis: [
      {
        type: 'value',
        name: '项目数',
        position: 'left',
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af', fontSize: 10 }
      },
      {
        type: 'value',
        name: '评分数',
        position: 'right',
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af', fontSize: 10 }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#f3f4f6',
      borderWidth: 1,
      textStyle: { color: '#1f2937' },
      padding: [8, 12]
    },
    legend: {
      data: ['项目数', '评分数'],
      top: 10,
      textStyle: { color: '#6b7280' }
    },
    series: [
      {
        name: '项目数',
        data: projectsData,
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: '#6366f1' },
        lineStyle: { width: 2, color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#6366f120' },
              { offset: 1, color: '#6366f100' }
            ]
          }
        }
      },
      {
        name: '评分数',
        data: scoresData,
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 2, color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10b98120' },
              { offset: 1, color: '#10b98100' }
            ]
          }
        }
      }
    ]
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

  // 初始化趋势图
  if (trendsChartRef.value) {
    trendsChart = echarts.init(trendsChartRef.value)
    trendsChart.setOption(trendsChartOption.value)
  }
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  trendsChart && trendsChart.resize()
}

// 监听图表数据变化
watch(trendsChartOption, () => {
  if (trendsChart) {
    trendsChart.setOption(trendsChartOption.value)
  }
})

// ==================== 加载平台统计数据 ====================
/**
 * 加载平台统计数据
 */
const loadPlatformStatistics = async () => {
  loading.value = true
  try {
    const response = await getPlatformStatistics()
    console.log('平台统计数据响应:', response)
    if (response.data) {
      // 计算统计数据用于顶部卡片
      const totalProjects = response.data.projectTrend?.[response.data.projectTrend.length - 1] || 0
      const totalScores = response.data.scoreTrend?.reduce((sum, score) => sum + score, 0) || 0
      const validScores = response.data.averageScoreTrend?.filter(score => score > 0) || []
      const averageScore = validScores.length > 0
        ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2)
        : 0

      platformStats.value = {
        totalProjects,
        totalScores,
        averageScore: Number(averageScore),
        dates: response.data.dates || [],
        projectTrend: response.data.projectTrend || [],
        scoreTrend: response.data.scoreTrend || [],
        averageScoreTrend: response.data.averageScoreTrend || []
      }
      console.log('更新后的平台统计:', platformStats.value)
    }
  } catch (error) {
    ElMessage.error('加载平台统计数据失败')
    console.error('加载平台统计失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    loadPlatformStatistics()
    initCharts()
    window.addEventListener('resize', handleResize)
  })
})

// 清理事件监听
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
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card--metric {
  --stat-card-bg: #ffffff;
  --stat-card-radius: 16px;
  --stat-card-padding: 24px;
  --stat-card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --stat-card-hover-transform: translateY(-2px);
  --stat-card-hover-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  --stat-head-gap: 16px;
  --stat-label-size: 0.875rem;
  --stat-label-color: #6b7280;
  --stat-label-weight: 500;
  --stat-label-margin: 0 0 4px 0;
  --stat-value-size: 2rem;
  --stat-value-color: #1f2937;
  --stat-value-weight: 700;
  --stat-value-margin: 0 0 4px 0;
  --stat-sub-size: 0.875rem;
  --stat-sub-color: #9ca3af;
  --stat-sub-margin: 0 0 16px 0;
}

/* 将原有的 .stat-icon 及相关颜色类替换为以下代码 */
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

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

/* -------------------------- 下方主内容区 -------------------------- */
.main-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  /* grid-template-columns: 2fr 1fr; */
  gap: 24px;
}

@media (max-width: 1023px) {
  .main-content-wrapper {
    grid-template-columns: 1fr;
  }
}

/* 图表卡片 */
.chart-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
}

.chart-header {
  margin-bottom: 24px;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.trends-chart {
  width: 100%;
  height: 400px;
}

/* 右侧卡片容器 */
.side-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计网格布局 - 保留用于其他可能的展示 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin: 0 auto;
}

/* 汇总卡片 */
.summary-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.card-badge {
  display: inline-block;
  background: #ecfdf5;
  color: #059669;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* 平台数据汇总卡片 - 未使用的样式保留以备后用 */
.summary-content {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.summary-item .label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 500;
}

.summary-item .value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.summary-item .unit {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 4px;
}

.divider {
  width: 1px;
  height: 60px;
  background: #e5e7eb;
}

/* 洞察卡片和建议卡片 */
.insight-card,
.suggestion-card {
  width: 100%;
}

.emerald-bg {
  background-color: #d1fae5;
}

.indigo-bg {
  background-color: #e0e7ff;
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
