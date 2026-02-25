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
            <!-- <TestBtn>开始</TestBtn> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 数据卡片区：网格布局+磨砂质感+悬停交互 -->
    <div class="card-grid">
      <!-- <TestBtn>开始</TestBtn> -->
      <!-- 项目进度卡片 -->
      <ChartCard title="评分完成进度" ring-chart ring-progress="38"></ChartCard>

      <!-- 打分趋势卡片 -->
      <ChartCard title="打分趋势" icon="TrendCharts" line-chart>
        <template #description>最近7日打分数量
          <span class="positive">132</span>
          条
        </template>
        <!-- <template #footer>
          更新于 {{ updateTime }}
        </template> -->
      </ChartCard>

      <!-- 待处理任务卡片 -->
      <ChartCard title="待处理任务" icon="Clock">
        <template #body>
          <div class="task-list">
            <div class="task-item" v-for="task in taskList" :key="task.id">
              <div class="task-dot" :style="{ backgroundColor: task.color }"></div>
              <div class="task-content">
                <span class="task-name">{{ task.name }}</span>
                <span class="task-deadline">{{ task.deadline }}</span>
              </div>
            </div>
          </div>
        </template>
      </ChartCard>

      <ChartCard title="快捷操作" icon="Setting">
        <template #body>
          <div class="shortcut-grid">
            <div v-for="item in shortcutList" :key="item.id">
              <div class="shortcut-item" v-if="showShortcutIcon(item.admin)">
                <el-icon class="shortcut-icon" :style="{ color: item.color }">
                  <component :is="item.icon" />
                </el-icon>
                <span class="shortcut-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #footer>自定义入口</template>
      </ChartCard>
      <!-- 快捷入口卡片 -->
    </div>

    <!-- 加载动画（初始入场） -->
    <!-- <div class="loading-overlay" v-if="loading">
      <div class="breathing-circle"></div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
// import {
//   Progress, List, TrendCharts, Clock, Setting,
//   Plus, User, FolderOpened, Document, Check
// } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/modules/userStore';
import ChartCard from '@/components/common/data/ChartCard.vue';
import TestBtn from '@/components/common/testBtn.vue';
// import { formatRoleValue } from '@/utils/format.js';

// 状态管理
const userStore = useUserStore();
const loading = ref(true);
const cardFlipState = ref({ project: false });
const sparklineCanvas = ref(null);
let sparklineChart = null;

// 模拟数据
const userName = computed(() => userStore.userInfo.username || '管理者');
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
  { id: 1, name: '新增项目', path: '', icon: 'Plus', color: '#FFB7C5', admin: true },
  { id: 2, name: '用户管理', path: '', icon: 'User', color: '#88D18A', admin: true },
  { id: 3, name: '项目管理', path: '', icon: 'FolderOpened', color: '#2D3142', admin: true },
  { id: 4, name: '打分记录', path: '', icon: 'Document', color: '#9FA8A3' },
  { id: 5, name: '已完成项', path: '', icon: 'Check', color: '#6B7280' }
]);
const showShortcutIcon = (needAdmin) => {
  if (needAdmin && userStore.isAdmin) {
    return true;
  }
  else if (!needAdmin) {
    return true;
  }

}
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
  max-height: 100vh;
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
  transition: all 0.3s;
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
  /* background: var(--gray-box-shadow); */
  background: linear-gradient(to right, rgb(142, 158, 171), rgb(217, 221, 222));
  /* background-image: linear-gradient(154deg, #b6b9ba, #8d8d93); */
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
  color: #88D18A;
  font-weight: 700;
}

.welcome-desc {
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  font-weight: 200;
}

.stats-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.go-judge {
  margin-left: auto;
  align-self: center;
}

.go-judge-btn {
  width: 100px;
  height: 50px;
  border: none;
  border-radius: 16px;
  box-shadow: 8px 8px 16px #b6b9ba,
    -8px -8px 16px #fafafd;
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

/* .positive {
  color: #88D18A;
  font-weight: 500;
} */

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
  flex-direction: row;
  align-items: center;
  gap: 1.2rem;
}

.task-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.task-content {
  display: flex;
  /* flex-direction: column; */
  justify-content: space-between;
  /* gap: 15px; */
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
