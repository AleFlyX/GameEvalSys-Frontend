<template>
  <div class="zen-home-container">
    <!-- 顶部欢迎区：留白+渐变+自然纹理 -->
    <div class="welcome-section">
      <div class="welcome-bg"></div>
      <div class="welcome-content">
        <h1 class="welcome-title">
          Welcome! <span class="user-name">{{ userName }}</span>
        </h1>
        <p class="welcome-desc">
          C++ 项目评分平台
        </p>
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">{{ projectCount }}</span>
            <span class="stat-label">活跃项目</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ scoreCount }}</span>
            <span class="stat-label">待打分项</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ completeRate }}%</span>
            <span class="stat-label">完成进度</span>
          </div>
          <div class="go-judge">
            <button class="go-judge-btn">开始评分</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据卡片区：网格布局+磨砂质感+悬停交互 -->
    <div class="card-grid">
      <!-- 项目进度卡片 -->
      <div class="zen-card" @click="toggleCardFlip('project')">
        <div class="card-inner" :class="{ flipped: cardFlipState.project }">
          <!-- 卡片正面 -->
          <div class="card-front">
            <div class="card-header">
              <span class="card-title">项目进度</span>
              <el-icon class="card-icon"><Progress /></el-icon>
            </div>
            <div class="card-body">
              <div class="ring-chart">
                <div class="ring-progress"></div>
                <div class="ring-progress" :style="{ '--progress': completeRate + '%' }"></div>
                <div class="ring-text">{{ completeRate }}%</div>
              </div>
              <div class="chart-desc">
                本周完成率较上周提升 <span class="positive">2.4%</span>
              </div>
            </div>
            <div class="card-footer">点击查看详情</div>
          </div>
          <!-- 卡片背面 -->
          <div class="card-back">
            <div class="card-header">
              <span class="card-title">项目详情</span>
              <el-icon class="card-icon">
                <List />
              </el-icon>
            </div>
            <div class="card-body">
              <ul class="detail-list">
                <li v-for="item in projectDetail" :key="item.id">
                  <span class="detail-name">{{ item.name }}</span>
                  <span class="detail-rate">{{ item.rate }}%</span>
                </li>
              </ul>
            </div>
            <div class="card-footer">点击返回</div>
          </div>
        </div>
      </div>

      <!-- 打分趋势卡片 -->
      <div class="zen-card">
        <div class="card-header">
          <span class="card-title">打分趋势</span>
          <el-icon class="card-icon">
            <TrendCharts />
          </el-icon>
        </div>
        <div class="card-body">
          <div class="sparkline-chart">
            <canvas ref="sparklineCanvas"></canvas>
          </div>
          <div class="chart-desc">
            近7天打分数量 <span class="positive">{{ trendTotal }}</span> 条
          </div>
        </div>
        <div class="card-footer">更新于 {{ updateTime }}</div>
      </div>

      <!-- 待处理任务卡片 -->
      <div class="zen-card">
        <div class="card-header">
          <span class="card-title">待处理任务</span>
          <el-icon class="card-icon">
            <Clock />
          </el-icon>
        </div>
        <div class="card-body">
          <div class="task-list">
            <div class="task-item" v-for="task in taskList" :key="task.id">
              <div class="task-dot" :style="{ backgroundColor: task.color }"></div>
              <div class="task-content">
                <span class="task-name">{{ task.name }}</span>
                <span class="task-deadline">{{ task.deadline }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <el-button type="text" class="task-more">查看全部</el-button>
        </div>
      </div>

      <!-- 快捷入口卡片 -->
      <div class="zen-card">
        <div class="card-header">
          <span class="card-title">快捷操作</span>
          <el-icon class="card-icon">
            <Setting />
          </el-icon>
        </div>
        <div class="card-body">
          <div class="shortcut-grid">
            <div class="shortcut-item" v-for="item in shortcutList" :key="item.id">
              <el-icon class="shortcut-icon" :style="{ color: item.color }">
                <component :is="item.icon" />
              </el-icon>
              <span class="shortcut-name">{{ item.name }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">自定义入口</div>
      </div>
    </div>

    <!-- 加载动画（初始入场） -->
    <div class="loading-overlay" v-if="loading">
      <div class="breathing-circle"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
// import {
//   Progress, List, TrendCharts, Clock, Setting,
//   Plus, User, FolderOpened, Document, Check
// } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/modules/userStore';
// import { formatRoleValue } from '@/utils/format.js';

// 状态管理
const userStore = useUserStore();
const loading = ref(true);
const cardFlipState = ref({ project: false });
const sparklineCanvas = ref(null);
let sparklineChart = null;

// 模拟数据
const userName = computed(() => userStore.userInfo.realName || userStore.userInfo.username || '管理者');
const projectCount = ref(8);
const scoreCount = ref(12);
const completeRate = ref(78);
const trendTotal = ref(156);
const updateTime = ref('2026-03-10 14:20');

// 项目详情数据
const projectDetail = ref([
  { id: 1, name: '2026中期答辩', rate: 85 },
  { id: 2, name: '年度项目评审', rate: 72 },
  { id: 3, name: '毕业设计打分', rate: 90 },
  { id: 4, name: '实验室考核', rate: 65 }
]);

// 待处理任务数据
const taskList = ref([
  { id: 1, name: '完成中期答辩打分', deadline: '2026-03-15', color: '#FFB7C5' },
  { id: 2, name: '审核新增项目申请', deadline: '2026-03-12', color: '#88D18A' },
  { id: 3, name: '更新打分标准配置', deadline: '2026-03-18', color: '#2D3142' }
]);

// 快捷入口数据
const shortcutList = ref([
  { id: 1, name: '新增项目', icon: 'Plus', color: '#FFB7C5' },
  { id: 2, name: '用户管理', icon: 'User', color: '#88D18A' },
  { id: 3, name: '项目管理', icon: 'FolderOpened', color: '#2D3142' },
  { id: 4, name: '打分记录', icon: 'Document', color: '#9FA8A3' },
  { id: 5, name: '已完成项', icon: 'Check', color: '#6B7280' }
]);

// 卡片翻转切换
const toggleCardFlip = (cardType) => {
  cardFlipState.value[cardType] = !cardFlipState.value[cardType];
};

// 绘制Sparkline趋势图
const drawSparkline = () => {
  const canvas = sparklineCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  // 设置canvas尺寸（适配容器）
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // 模拟7天趋势数据
  const data = [18, 25, 20, 30, 22, 28, 32];
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const width = canvas.width;
  const height = canvas.height;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 绘制趋势线
  ctx.beginPath();
  ctx.moveTo(0, height - (data[0] - minValue) / (maxValue - minValue) * height + 10);

  for (let i = 1; i < data.length; i++) {
    const x = (width / (data.length - 1)) * i;
    const y = height - (data[i] - minValue) / (maxValue - minValue) * height + 10;
    ctx.lineTo(x, y);
  }

  // 样式：抹茶绿渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(136, 209, 138, 0.6)');
  gradient.addColorStop(1, 'rgba(136, 209, 138, 0.1)');

  ctx.strokeStyle = '#88D18A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 填充下方区域
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fillStyle = gradient;
  ctx.fill();

  // 绘制数据点
  data.forEach((value, index) => {
    const x = (width / (data.length - 1)) * index;
    const y = height - (value - minValue) / (maxValue - minValue) * height + 10;

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#88D18A';
    ctx.fill();
  });
};

// 生命周期
onMounted(() => {
  // 模拟加载动画（禅意呼吸效果）
  setTimeout(() => {
    loading.value = false;
    // 绘制趋势图
    drawSparkline();
    // 监听窗口大小变化，重新绘制图表
    window.addEventListener('resize', drawSparkline);
  }, 1500);
});

onUnmounted(() => {
  window.removeEventListener('resize', drawSparkline);
});
</script>

<style scoped>
/* 全局容器：日式禅意主色调+留白 */
.zen-home-container {
  width: 100%;
  min-height: 100vh;
  /* background-color: #F8F6F1; */
  /* 米白色主调 */
  padding: 2rem;
  box-sizing: border-box;
  font-family: "Noto Sans JP", "PingFang SC", sans-serif;
}

/* 加载动画：禅意呼吸效果 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #F8F6F1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.breathing-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB7C5 0%, #88D18A 100%);
  animation: breathing 3s ease-in-out infinite;
}

@keyframes breathing {

  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 顶部欢迎区：渐变+自然纹理+留白 */
.welcome-section {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.welcome-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #fafafd;
  background-image: linear-gradient(154deg, #f4f6f8, #b6b9ba); */
  box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #fafafd;
  background-image: linear-gradient(154deg, #b6b9ba, #8d8d93);
  /* background: url('https://picsum.photos/id/1048/1920/1080') center/cover no-repeat; */
  /* filter: brightness(0.8) contrast(0.9); */
  /* 渐变遮罩：营造深度感 */
  /* background-image: linear-gradient(rgba(45, 49, 66, 0.1), rgba(45, 49, 66, 0.6)),
    url('https://picsum.photos/id/1048/1920/1080'); */
}

.welcome-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4rem;
  color: #F8F6F1;
}

.welcome-title {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  font-weight: 300;
  letter-spacing: 2px;
}

.user-name {
  color: #FFB7C5;
  font-weight: 500;
}

.welcome-desc {
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  font-weight: 200;
}

.stats-bar {
  display: flex;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.go-judge {
  justify-self: flex-end;
  align-self: center;
}

.go-judge-btn {
  width: 100px;
  height: 50px;
  border: none;
  border-radius: 16px;
  box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #8d8d93;
  background-image: linear-gradient(154deg, #f4f6f8, #b6b9ba);
  transition: all 0.3s ease-in-out;
}

.go-judge-btn:active {
  box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #ceced6;
  background-image: linear-gradient(154deg, #b6b9ba, #f4f6f8);
}

.stat-value {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #88D18A;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 数据卡片网格：响应式布局+留白 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
}

/* 禅意卡片：磨砂质感+微妙阴影+悬停交互 */
.zen-card {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  /* 磨砂玻璃效果 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(45, 49, 66, 0.08);
  transition: all 0.4s ease;
  cursor: pointer;
  perspective: 1000px;
  /* 3D翻转视角 */
}

.zen-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 24px rgba(45, 49, 66, 0.12);
  filter: brightness(1.02);
}

/* 卡片3D翻转效果 */
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.zen-card .flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  padding: 1.5rem;
  box-sizing: border-box;
}

.card-back {
  transform: rotateY(180deg);
  background-color: rgba(45, 49, 66, 0.9);
  color: #F8F6F1;
}

/* 卡片内部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(45, 49, 66, 0.1);
}

.card-back .card-header {
  border-bottom-color: rgba(248, 246, 241, 0.2);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2D3142;
}

.card-back .card-title {
  color: #F8F6F1;
}

.card-icon {
  font-size: 1.2rem;
  color: #88D18A;
}

.card-back .card-icon {
  color: #FFB7C5;
}

.card-body {
  height: calc(100% - 6rem);
  overflow-y: auto;
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

.card-back .card-footer {
  color: #F8F6F1;
  opacity: 0.7;
}

/* 环形进度图 */
.ring-chart {
  position: relative;
  width: 160px;
  height: 160px;
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

.card-back .ring-progress::after {
  background-color: rgba(45, 49, 66, 0.8);
}

.ring-text {
  position: relative;
  z-index: 2;
  font-size: 2rem;
  font-weight: 500;
  color: #2D3142;
}

.card-back .ring-text {
  color: #F8F6F1;
}

.chart-desc {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #6B7280;
}

.card-back .chart-desc {
  color: #F8F6F1;
  opacity: 0.8;
}

.positive {
  color: #88D18A;
  font-weight: 500;
}

/* Sparkline趋势图容器 */
.sparkline-chart {
  width: 100%;
  height: 120px;
  margin-bottom: 1rem;
}

/* 任务列表样式 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.task-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.task-name {
  font-size: 0.95rem;
  color: #2D3142;
}

.card-back .task-name {
  color: #F8F6F1;
}

.task-deadline {
  font-size: 0.8rem;
  color: #9FA8A3;
}

.task-more {
  color: #88D18A !important;
  padding: 0 !important;
}

/* 快捷入口网格 */
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.shortcut-item:hover {
  background-color: rgba(45, 49, 66, 0.05);
  transform: scale(1.05);
}

.shortcut-icon {
  font-size: 1.5rem;
}

.shortcut-name {
  font-size: 0.85rem;
  color: #2D3142;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .zen-home-container {
    padding: 1rem;
  }

  .welcome-section {
    height: 250px;
  }

  .welcome-content {
    padding: 0 2rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .stats-bar {
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
