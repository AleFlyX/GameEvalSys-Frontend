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
      <StatCard v-for="card in statCards" :key="card.key" :label="card.label" :value="card.value" :sub="card.sub"
        :icon="card.icon" />
    </section>

    <section class="dashboard-grid">
      <!-- 趋势图 -->
      <TrendMap :trend-points="trendPoints">
        <template #header>
          <div class="panel-header">
            <h2>最近 7 天打分趋势</h2>
            <span>总计 {{ trendTotal }} 条</span>
          </div>
        </template>
      </TrendMap>

      <ProgressCard :dashboard-stats="dashboardStats">
        <template #header>
          <div class="panel-header">
            <h2>整体完成率</h2>
            <span>按当前可见项目计算</span>
          </div>
        </template>
      </ProgressCard>

      <TasksPanel :pending-tasks="pendingTasks">
        <template #header>
          <div class="panel-header">
            <h2>待处理任务</h2>
            <span>项目：{{ focusProjectName }}</span>
          </div>
        </template>
      </TasksPanel>

      <ShortcutPanel :shortcut-list="shortcutList" @navigate="jumpTo">
        <template #header>
          <div class="panel-header">
            <h2>快捷入口</h2>
            <span>按角色自动展示</span>
          </div>
        </template>
      </ShortcutPanel>
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
import { useLoading } from '@/composables/useLodaing';
import StatCard from '@/components/common/data/StatCard.vue';
import { formatTime } from '@/utils/format';
import TrendMap from './components/trendMap.vue';
import ProgressCard from './components/progressCard.vue';
import TasksPanel from './components/TasksPanel.vue';
import ShortcutPanel from './components/ShortcutPanel.vue';

const router = useRouter();                 // 路由实例，用于页面跳转
const userStore = useUserStore();           // 用户状态存储（角色、用户信息等）
const message = useMessage();               // 消息提示工具

const { isLoading: loading, start: startLoading, end: endLoading } = useLoading('home:dashboard');

const trendPoints = ref([]);                // 最近7天打分趋势数据点 [{ label, count }]
const pendingTasks = ref([]);               // 待处理任务列表（当前焦点项目未评分的小组）
const focusProjectName = ref('暂无项目');    // 当前聚焦的项目名称

const dashboardStats = reactive({
  totalProjects: 0,      // 可见项目总数
  ongoingProjects: 0,    // 进行中的项目数
  endedProjects: 0,      // 已结束的项目数
  pendingGroups: 0,      // 待评分小组数（焦点项目内）
  completionRate: 0,     // 完成率（已结束项目占比）
});

const PROJECT_PAGE_SIZE = 100;          // 项目列表分页大小
const SCORE_RECORD_PAGE_SIZE = 200;     // 评分记录分页大小
const roleSet = ['super_admin', 'admin', 'scorer'];  // 拥有评分权限的角色集合

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

// 近7天打分总条数
const trendTotal = computed(() => {
  return trendPoints.value.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
});

// 统计卡片配置（展示在页面顶部）
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

// 快捷入口列表（根据用户角色动态过滤）
const shortcutList = computed(() => {
  const role = userStore.userRole;
  const source = [
    { id: 'scoring', name: '打分列表', path: '/scoring', icon: 'Edit', color: '#409eff', roles: roleSet },
    { id: 'project', name: '项目管理', path: '/admin/project', icon: 'Management', color: '#ffaa00', roles: ['super_admin', 'admin'] },
    { id: 'projectGroup', name: '受审队伍', path: '/admin/project-groups', icon: 'User', color: '#66cc66', roles: ['super_admin', 'admin'] },
    { id: 'statistic', name: '统计分析', path: '/admin/statistic', icon: 'TrendCharts', color: '#f56c6c', roles: ['super_admin', 'admin'] },
    { id: 'user', name: '用户管理', path: '/admin/user', icon: 'Avatar', color: '#7b89ff', roles: ['super_admin', 'admin'] },
    { id: 'home', name: '首页', path: '/home', icon: 'HomeFilled', color: '#9ca3af', roles: ['super_admin', 'admin', 'scorer', 'normal'] },
  ];
  return source.filter((item) => item.roles.includes(role));
});

// 页面跳转
const jumpTo = (path) => {
  if (!path) return;
  router.push(path);
};

// 点击“开始评分”按钮，校验权限后跳转到打分页面
const handleGoScoring = () => {
  if (!roleSet.includes(userStore.userRole)) {
    message.info('当前角色没有评分权限');
    return;
  }
  router.push('/scoring');
};

// 获取日期对应的 key（YYYY-MM-DD）
const getDayKey = (date) => {
  return formatTime(date, 'YYYY-MM-DD');
};

// 获取日期显示的标签（MM/DD）
const getDayLabel = (date) => {
  return formatTime(date, 'MM/DD');
};

// 安全解析日期字符串，支持 "YYYY-MM-DD" 格式
const parseDate = (value) => {
  if (!value) return null;
  const candidate = new Date(String(value).replace(/-/g, '/'));
  if (Number.isNaN(candidate.getTime())) return null;
  return candidate;
};

//  规范化项目接口返回的数据结构
const normalizeProjectResponse = (response) => {
  const list = Array.isArray(response?.data?.list) ? response.data.list : [];
  const total = Number(response?.data?.total);
  return {
    list,
    total: Number.isFinite(total) ? total : list.length,
  };
};

/**
 * 获取核心数据
 * 获取当前用户可见的项目列表
 * 根据是否为管理员，尝试调用不同接口（有权限的接口优先）
 */
const fetchProjectList = async () => {
  // const candidates = userStore.isAdmin
  //   ? [
  //     () => projectApi.getProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
  //     () => projectApi.getAuthorizedProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
  //   ]
  //   : [
  //     () => projectApi.getAuthorizedProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
  //     () => projectApi.getProjectList({ page: 1, size: PROJECT_PAGE_SIZE }),
  //   ];
  const candidates = [
    () => projectApi.getAuthorizedProjectList({ page: 1, size: PROJECT_PAGE_SIZE })
  ];
  for (const requester of candidates) {
    try {
      const response = await requester();
      return normalizeProjectResponse(response);
    } catch (e) {
      console.error('init requester error', e)
      // 尝试下一个可用接口，保证首页可回退展示
    }
  }

  return { list: [], total: 0 };
};

/**
 * 从项目列表中挑选“焦点项目”
 * 优先级：进行中 > 未开始 > 第一个项目 > null
 * @return {Object} 焦点项目
 */
const pickFocusProject = (projects) => {
  return (
    projects.find((project) => project?.status === 'ongoing') ||
    projects.find((project) => project?.status === 'not_started') ||
    projects[0] ||
    null
  );
};

/**
 * 根据评分记录构建最近7天的趋势数据
 * @param {Array} records 评分记录列表
 * @returns {Array} 包含 label 和 count 的数组
 */
const buildTrendPoints = (records) => {
  const today = new Date();
  const trendMap = new Map();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i)
    trendMap.set(getDayKey(date), {
      label: getDayLabel(date),
      count: 0,
    });
  }
  // 统计每条记录所属日期的数量
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

/**
 * 构建待处理任务列表（未评分的小组）
 * @param {Array} groups 项目下所有小组
 * @param {Set} scoredGroupIdSet 已评分的小组ID集合
 * @param {Object} project 当前项目信息
 * @returns {Array} 任务列表（最多6条）
 */
const buildPendingTasks = (groups, scoredGroupIdSet, project) => {
  const deadline = project?.endDate ? `截止：${project.endDate}` : '截止时间待定';
  const pendingGroups = groups.filter((group) => !scoredGroupIdSet.has(Number(group?.id)));

  return pendingGroups.slice(0, 6).map((group) => ({
    id: group.id,
    name: `完成「${group.name || `小组${group.id}`}」评分`,
    deadline,
  }));
};

/**
 * 更新项目统计汇总数据（总项目数、进行中/已结束数量、完成率）
 */
const updateSummaryStats = (projects, total) => {
  const ongoingCount = projects.filter((item) => item?.status === 'ongoing').length;
  const endedCount = projects.filter((item) => item?.status === 'ended').length;

  dashboardStats.totalProjects = total;
  dashboardStats.ongoingProjects = ongoingCount;
  dashboardStats.endedProjects = endedCount;
  dashboardStats.completionRate = total > 0 ? Math.round((endedCount / total) * 100) : 0;
};

// 重置焦点项目相关的数据（趋势、待办、小组统计、项目名称）
const resetTaskAndTrend = () => {
  dashboardStats.pendingGroups = 0;
  trendPoints.value = [];
  pendingTasks.value = [];
  focusProjectName.value = '暂无项目';
};

/**
 * 获取焦点项目下的详细信息（小组列表、评分记录），并更新趋势和待办任务
 * @param {Object} project 焦点项目
 */
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

/**
 * 首页主要数据加载函数：获取项目列表 -> 更新统计 -> 获取焦点项目详情
 */
const fetchHomeData = async () => {
  startLoading();

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
    endLoading();
  }
};

onMounted(() => {
  fetchHomeData();
});
</script>

<style scoped>
@import './styles/HomePage.css';
</style>
