<template>
  <div class="home-page" v-loading="loading">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="hero-eyebrow">PROJECT EVALUATE DASHBOARD</p>
        <h1 class="hero-title">
          欢迎回来，<span>{{ userName }}</span>
        </h1>
        <p class="hero-desc">
          {{ roleLabel }} · 当前聚焦项目：{{ focusProjectName }}
        </p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" @click="handleGoScoring">
          开始评分
        </el-button>
        <!-- <el-button @click="fetchHomeData">
          刷新数据
        </el-button> -->
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="card in statCards" :key="card.key" class="stat-card">
        <div class="stat-head">
          <div class="stat-icon-wrap">
            <el-icon class="stat-icon">
              <component :is="resolveIcon(card.icon)" />
            </el-icon>
          </div>
          <span class="stat-label">{{ card.label }}</span>
        </div>
        <p class="stat-value">{{ card.value }}</p>
        <p class="stat-sub">{{ card.sub }}</p>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="dashboard-panel trend-panel">
        <div class="panel-header">
          <h2>最近 7 天打分趋势</h2>
          <span>总计 {{ trendTotal }} 条</span>
        </div>
        <div v-if="trendPoints.length" class="trend-chart">
          <div v-for="point in trendPoints" :key="point.label" class="trend-column">
            <div class="trend-bar-bg">
              <div class="trend-bar" :style="{ height: toBarHeight(point.count) }"></div>
            </div>
            <span class="trend-date">{{ point.label }}</span>
            <span class="trend-count">{{ point.count }}</span>
          </div>
        </div>
        <el-empty v-else description="暂无趋势数据" />
      </article>

      <article class="dashboard-panel progress-panel">
        <div class="panel-header">
          <h2>整体完成率</h2>
          <span>按当前可见项目计算</span>
        </div>
        <div class="progress-main">
          <el-progress type="dashboard" :percentage="dashboardStats.completionRate" :stroke-width="10"
            color="#409eff" />
        </div>
        <p class="progress-desc">
          进行中项目 {{ dashboardStats.ongoingProjects }} 个，已结束 {{ dashboardStats.endedProjects }} 个。
        </p>
      </article>

      <article class="dashboard-panel tasks-panel">
        <div class="panel-header">
          <h2>待处理任务</h2>
          <span>项目：{{ focusProjectName }}</span>
        </div>
        <div class="task-list">
          <div v-if="pendingTasks.length === 0" class="task-empty">
            当前没有待处理任务
          </div>
          <div v-for="task in pendingTasks" :key="task.id" class="task-item">
            <span class="task-dot"></span>
            <div class="task-content">
              <p class="task-name">{{ task.name }}</p>
              <p class="task-deadline">{{ task.deadline }}</p>
            </div>
          </div>
        </div>
      </article>

      <article class="dashboard-panel shortcut-panel">
        <div class="panel-header">
          <h2>快捷入口</h2>
          <span>按角色自动展示</span>
        </div>
        <div class="shortcut-grid">
          <button v-for="item in shortcutList" :key="item.id" class="shortcut-item" type="button"
            @click="jumpTo(item.path)">
            <el-icon class="shortcut-icon" :style="{ color: item.color }">
              <component :is="resolveIcon(item.icon)" />
            </el-icon>
            <span>{{ item.name }}</span>
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { projectApi } from '@/api/project';
import { projectGroupApi } from '@/api/project-group';
import { ScoringApi } from '@/api/scoring';
import { useMessage } from '@/composables/useMessage';
import { useUserStore } from '@/stores/modules/userStore';
import { getElementIcon } from '@/utils/elementIcons';

const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

const loading = ref(false);
const trendPoints = ref([]);
const pendingTasks = ref([]);
const focusProjectName = ref('暂无项目');

const dashboardStats = reactive({
  totalProjects: 0,
  ongoingProjects: 0,
  endedProjects: 0,
  pendingGroups: 0,
  completionRate: 0,
});

const PROJECT_PAGE_SIZE = 100;
const SCORE_RECORD_PAGE_SIZE = 200;
const roleSet = ['super_admin', 'admin', 'scorer'];

const userName = computed(() => {
  return userStore.userInfo?.username || userStore.userInfo?.name || '用户';
});

const roleLabel = computed(() => {
  const roleMap = {
    super_admin: '超级管理员',
    admin: '管理员',
    scorer: '打分员',
    normal: '普通用户',
  };
  return roleMap[userStore.userRole] || '访问用户';
});

const trendMax = computed(() => {
  if (!trendPoints.value.length) return 1;
  return Math.max(1, ...trendPoints.value.map((item) => Number(item.count) || 0));
});

const trendTotal = computed(() => {
  return trendPoints.value.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
});

const statCards = computed(() => {
  return [
    {
      key: 'total',
      label: '我的项目',
      value: dashboardStats.totalProjects,
      sub: '当前可见项目总数',
      icon: 'FolderOpened',
    },
    {
      key: 'ongoing',
      label: '进行中项目',
      value: dashboardStats.ongoingProjects,
      sub: '当前仍可继续评分',
      icon: 'Clock',
    },
    {
      key: 'pending',
      label: '待评分小组',
      value: dashboardStats.pendingGroups,
      sub: '焦点项目中未完成评分',
      icon: 'Edit',
    },
    {
      key: 'rate',
      label: '完成率',
      value: `${dashboardStats.completionRate}%`,
      sub: '已结束项目占比',
      icon: 'DataAnalysis',
    },
  ];
});

const shortcutList = computed(() => {
  const role = userStore.userRole;
  const source = [
    { id: 'scoring', name: '打分列表', path: '/scoring', icon: 'Edit', color: '#409eff', roles: roleSet },
    { id: 'project', name: '项目管理', path: '/project', icon: 'Management', color: '#ffaa00', roles: ['super_admin', 'admin'] },
    { id: 'projectGroup', name: '受审队伍', path: '/projectGroups', icon: 'User', color: '#66cc66', roles: ['super_admin', 'admin'] },
    { id: 'statistic', name: '统计分析', path: '/statistic', icon: 'TrendCharts', color: '#f56c6c', roles: ['super_admin', 'admin'] },
    { id: 'user', name: '用户管理', path: '/user', icon: 'Avatar', color: '#7b89ff', roles: ['super_admin', 'admin'] },
    { id: 'home', name: '首页', path: '/home', icon: 'HomeFilled', color: '#9ca3af', roles: ['super_admin', 'admin', 'scorer', 'normal'] },
  ];
  return source.filter((item) => item.roles.includes(role));
});

const resolveIcon = (iconName) => getElementIcon(iconName);

const jumpTo = (path) => {
  if (!path) return;
  router.push(path);
};

const handleGoScoring = () => {
  if (!roleSet.includes(userStore.userRole)) {
    message.info('当前角色没有评分权限');
    return;
  }
  router.push('/scoring');
};

const padNumber = (value) => String(value).padStart(2, '0');

const getDayKey = (date) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
};

const getDayLabel = (date) => {
  return `${padNumber(date.getMonth() + 1)}/${padNumber(date.getDate())}`;
};

const parseDate = (value) => {
  if (!value) return null;
  const candidate = new Date(String(value).replace(/-/g, '/'));
  if (Number.isNaN(candidate.getTime())) return null;
  return candidate;
};

const normalizeProjectResponse = (response) => {
  const list = Array.isArray(response?.data?.list) ? response.data.list : [];
  const total = Number(response?.data?.total);
  return {
    list,
    total: Number.isFinite(total) ? total : list.length,
  };
};

const fetchProjectList = async () => {
  const candidates = userStore.isAdmin
    ? [
      () => projectApi.getProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
      () => projectApi.getAuthorizedProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
    ]
    : [
      () => projectApi.getAuthorizedProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
      () => projectApi.getProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
    ];

  for (const requester of candidates) {
    try {
      const response = await requester();
      return normalizeProjectResponse(response);
    } catch (_) {
      // 尝试下一个可用接口，保证首页可回退展示
    }
  }

  return { list: [], total: 0 };
};

const pickFocusProject = (projects) => {
  return (
    projects.find((project) => project?.status === 'ongoing') ||
    projects.find((project) => project?.status === 'not_started') ||
    projects[0] ||
    null
  );
};

const buildTrendPoints = (records) => {
  const today = new Date();
  const trendMap = new Map();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    trendMap.set(getDayKey(date), {
      label: getDayLabel(date),
      count: 0,
    });
  }

  records.forEach((item) => {
    const recordDate = parseDate(item?.updateTime || item?.createTime);
    if (!recordDate) return;
    const key = getDayKey(recordDate);
    if (!trendMap.has(key)) return;
    const oldVal = trendMap.get(key);
    trendMap.set(key, { ...oldVal, count: oldVal.count + 1 });
  });

  return Array.from(trendMap.values());
};

const buildPendingTasks = (groups, scoredGroupIdSet, project) => {
  const deadline = project?.endDate ? `截止：${project.endDate}` : '截止时间待定';
  const pendingGroups = groups.filter((group) => !scoredGroupIdSet.has(Number(group?.id)));

  return pendingGroups.slice(0, 6).map((group) => ({
    id: group.id,
    name: `完成「${group.name || `小组${group.id}`}」评分`,
    deadline,
  }));
};

const updateSummaryStats = (projects, total) => {
  const ongoingCount = projects.filter((item) => item?.status === 'ongoing').length;
  const endedCount = projects.filter((item) => item?.status === 'ended').length;

  dashboardStats.totalProjects = total;
  dashboardStats.ongoingProjects = ongoingCount;
  dashboardStats.endedProjects = endedCount;
  dashboardStats.completionRate = total > 0 ? Math.round((endedCount / total) * 100) : 0;
};

const resetTaskAndTrend = () => {
  dashboardStats.pendingGroups = 0;
  trendPoints.value = [];
  pendingTasks.value = [];
  focusProjectName.value = '暂无项目';
};

const fetchProjectDetailData = async (project) => {
  if (!project?.id) {
    resetTaskAndTrend();
    return;
  }

  focusProjectName.value = project.name || `项目#${project.id}`;

  const [groupResponse, recordResponse] = await Promise.all([
    projectGroupApi.getProjectGroups(project.id),
    ScoringApi.getProjectSrocingRecds(project.id, { page: 1, size: SCORE_RECORD_PAGE_SIZE }),
  ]);

  const groupList = Array.isArray(groupResponse?.data) ? groupResponse.data : [];
  const records = Array.isArray(recordResponse?.data?.list) ? recordResponse.data.list : [];

  const scoredGroupIdSet = new Set(
    records.map((item) => Number(item?.groupId)).filter((id) => Number.isFinite(id)),
  );

  dashboardStats.pendingGroups = Math.max(groupList.length - scoredGroupIdSet.size, 0);
  trendPoints.value = buildTrendPoints(records);
  pendingTasks.value = buildPendingTasks(groupList, scoredGroupIdSet, project);
};

const toBarHeight = (count) => {
  const ratio = (Number(count) || 0) / trendMax.value;
  return `${Math.max(10, Math.round(ratio * 120))}px`;
};

const fetchHomeData = async () => {
  loading.value = true;

  try {
    const { list, total } = await fetchProjectList();
    updateSummaryStats(list, total);

    const focusProject = pickFocusProject(list);
    await fetchProjectDetailData(focusProject);
  } catch (error) {
    resetTaskAndTrend();
    message.error('首页数据加载失败，请稍后重试');
    console.error('home data load failed:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHomeData();
});
</script>

<style scoped>
.home-page {
  min-height: 100%;
  padding: 24px;
  font-family: "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  background:
    radial-gradient(circle at 12% 12%, rgba(64, 158, 255, 0.12) 0, rgba(64, 158, 255, 0) 32%),
    radial-gradient(circle at 88% 8%, rgba(102, 204, 102, 0.12) 0, rgba(102, 204, 102, 0) 26%),
    #f6f9fc;
}

.hero-panel,
.stat-card,
.dashboard-panel {
  animation: fadeUp 0.5s ease both;
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(120deg, #1f5fa8, #409eff 45%, #70b6ff);
  box-shadow: 0 14px 36px rgba(64, 158, 255, 0.25);
  color: #ffffff;
}

.hero-eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 1.5px;
  opacity: 0.82;
}

.hero-title {
  margin: 12px 0 8px;
  font-size: 32px;
  font-weight: 700;
}

.hero-title span {
  color: #d4f1ff;
}

.hero-desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.stat-card {
  border-radius: 16px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 24px rgba(31, 47, 70, 0.08);
  backdrop-filter: blur(10px);
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
}

.stat-icon {
  color: #409eff;
  font-size: 18px;
}

.stat-label {
  font-size: 13px;
  color: #66758a;
}

.stat-value {
  margin: 16px 0 4px;
  font-size: 34px;
  font-weight: 700;
  color: #1f2f46;
  line-height: 1;
}

.stat-sub {
  margin: 0;
  font-size: 12px;
  color: #9aa8bb;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.dashboard-panel {
  border-radius: 16px;
  padding: 18px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(20, 42, 74, 0.08);
}

.trend-panel {
  min-height: 320px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
  color: #1f2f46;
}

.panel-header span {
  font-size: 12px;
  color: #8a97aa;
}

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

.progress-panel,
.tasks-panel,
.shortcut-panel {
  min-height: 220px;
}

.progress-main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 160px;
}

.progress-desc {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: #637287;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-empty {
  padding: 28px 12px;
  text-align: center;
  color: #8a97aa;
  font-size: 13px;
  border: 1px dashed #dce6f4;
  border-radius: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: #f7fbff;
}

.task-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #409eff;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-name {
  margin: 0;
  font-size: 13px;
  color: #1f2f46;
}

.task-deadline {
  margin: 4px 0 0;
  font-size: 12px;
  color: #7d8da2;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.shortcut-item {
  border: none;
  border-radius: 10px;
  padding: 12px 10px;
  cursor: pointer;
  background: #f6f9fc;
  color: #45576f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.shortcut-item:hover {
  transform: translateY(-2px);
  background: #ebf3ff;
}

.shortcut-icon {
  font-size: 18px;
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

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .shortcut-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 14px;
  }

  .hero-panel {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-title {
    font-size: 26px;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions :deep(.el-button) {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .shortcut-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .trend-chart {
    gap: 6px;
  }
}
</style>
