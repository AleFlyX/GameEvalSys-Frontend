import { ref, onMounted } from 'vue';
import { projectApi } from '@/api/project';
import { ScoringApi } from '@/api/scoring';
import { getProjectGroups } from '@/api/project-group';
import { useProjectStore } from '@/stores/modules/projectStore';
import { useLoading } from '@/composables/useLoading';
import { useMessage } from '@/composables/useMessage';
import { useElPagination } from '@/composables/useElPagination';

/**
 * 获取数据、分页操作
 * @return {Object} 暴露给入口页的方法和变量
 */
export const useScoringList = () => {

  // 这里直接接入项目缓存：列表请求成功后预热详情数据
  const projectStore = useProjectStore();
  const message = useMessage();
  const scoringList = ref([]);
  // 项目维度的完成度缓存：避免翻页/刷新时重复请求同一项目
  const completionRateCache = new Map();
  const scoringOverview = ref({
    totalProjects: '0',
    ongoingProjects: '0',
    completedProjects: '0',
    pendingProjects: '0'
  });

  const {
    currentPage,
    pageSize,
    total,
    disabled,
    defaultPageSizes,
    handleSizeChange,
    handleCurrentChange,

  } = useElPagination({
    initialPage: 1,
    initialPageSize: 10,
    defaultPageSizes: [10, 20, 30],
    maxPageSize: 100,
    debounceTime: 200,
    onPageChange: async (page, size) => {
      await fetchScoringProjects({ page, size });
    }
  });
  const { isLoading: initLoading, start: StartInit, end: EndInit } = useLoading('scoringList:init');

  // 将后端可能返回的 0~1 或 0~100 统一归一为百分比字符串
  const normalizePercent = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;

    const percent = parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
    const rounded = Math.round(percent);
    const clamped = Math.min(100, Math.max(0, rounded));
    return `${clamped}%`;
  };

  // 优先使用列表已有字段计算完成度，减少额外接口调用
  const getCompletionRateFromProject = (projectItem) => {
    const directCompletion = projectItem?.completionRate;
    if (typeof directCompletion === 'string' && directCompletion.includes('%')) {
      return directCompletion;
    }

    const normalizedDirect = normalizePercent(directCompletion);
    if (normalizedDirect !== null) {
      return normalizedDirect;
    }

    const totalGroups = Number(
      projectItem?.groupTotal
      ?? projectItem?.groupCount
      ?? projectItem?.totalGroups
      ?? projectItem?.groupsTotal
    );
    const scoredGroups = Number(
      projectItem?.scoredGroupCount
      ?? projectItem?.scoredGroups
      ?? projectItem?.completedGroups
      ?? projectItem?.finishedGroupCount
    );

    if (Number.isFinite(totalGroups) && totalGroups >= 0 && Number.isFinite(scoredGroups) && scoredGroups >= 0) {
      if (totalGroups === 0) return '0%';
      return normalizePercent((scoredGroups / totalGroups) * 100) || '0%';
    }

    return null;
  };

  // 当列表缺少完成度字段时，按“已评分小组数 / 项目总小组数”兜底计算
  const fetchCompletionRateByProjectId = async (projectId) => {
    const numericProjectId = Number(projectId);
    if (!Number.isFinite(numericProjectId)) return '0%';
    // 命中缓存则直接返回，避免重复并发请求
    if (completionRateCache.has(numericProjectId)) {
      return completionRateCache.get(numericProjectId);
    }

    try {
      const [groupsResponse, recordsResponse] = await Promise.all([
        getProjectGroups(numericProjectId),
        ScoringApi.getProjectScoringRecds(numericProjectId, { page: 1, size: 100 }),
      ]);

      const groups = Array.isArray(groupsResponse?.data) ? groupsResponse.data : [];
      const totalGroups = groups.length;
      if (totalGroups === 0) {
        completionRateCache.set(numericProjectId, '0%');
        return '0%';
      }

      // 评分记录按 groupId 去重，确保一个小组重复打分只计一次完成
      const recordList = Array.isArray(recordsResponse?.data?.list) ? recordsResponse.data.list : [];
      const scoredGroupIds = new Set(recordList.map((item) => item?.groupId).filter((groupId) => Number.isFinite(Number(groupId))));
      const completionPercent = (scoredGroupIds.size / totalGroups) * 100;
      const computedRate = normalizePercent(completionPercent) || '0%';
      completionRateCache.set(numericProjectId, computedRate);
      return computedRate;
    } catch (error) {
      console.warn(`Fetch completion rate failed for project ${projectId}:`, error);
      return '0%';
    }
  };

  // 给当前页项目补齐 completionRate，保证表格列始终可展示
  const enrichCompletionRates = async (projects = []) => {
    const mappedProjects = await Promise.all((projects || []).map(async (projectItem) => {
      const cachedRate = getCompletionRateFromProject(projectItem);
      if (cachedRate !== null) {
        return {
          ...projectItem,
          completionRate: cachedRate,
        };
      }

      const completionRate = await fetchCompletionRateByProjectId(projectItem?.id);
      return {
        ...projectItem,
        completionRate,
      };
    }));

    return mappedProjects;
  };

  // 获取打分概览统计数据
  const fetchScoringOverview = async () => {
    try {
      const response = await ScoringApi.getScoringOverview();
      if (response.data) {
        scoringOverview.value = {
          totalProjects: String(response.data.totalProjects || 0),
          ongoingProjects: String(response.data.ongoingProjects || 0),
          completedProjects: String(response.data.completedProjects || 0),
          pendingProjects: String(response.data.pendingProjects || 0)
        };
      }
    } catch (error) {
      message.error('获取打分概览失败: ' + error);
      console.error('Error fetching scoring overview:', error);
    }
  };

  // 获取打分项目列表
  const fetchScoringProjects = async (params = { page: 1, size: 10 }) => {
    StartInit();
    try {
      disabled.value = true;

      const response = await projectApi.getAuthorizedProjectList(params)
      console.log('use ScoringList', response.data)
      const projectList = response.data.list || [];
      scoringList.value = await enrichCompletionRates(projectList);
      total.value = response.data.total || 0;

      // 仅在关键字段完整时预热缓存，避免把缺失字段的数据写进详情缓存
      scoringList.value.forEach((projectItem) => {
        const hasProjectId = Number.isFinite(Number(projectItem?.id));
        const hasStandardId = Number.isFinite(Number(projectItem?.standardId));
        if (hasProjectId && hasStandardId) {
          projectStore.setProjectDetails(projectItem);
        }
      });

    } catch (error) {
      message.error('获取项目列表失败: ' + error);
      console.error('Error fetching projects:', error);
    } finally {
      EndInit();
      disabled.value = false;
    }
  };
  // 初始化
  onMounted(() => {
    fetchScoringProjects();
    fetchScoringOverview();
  });
  // 刷新列表
  const handleRefresh = () => {
    fetchScoringProjects();
    fetchScoringOverview();
  };

  return {
    //El Pagination
    currentPage,
    pageSize,
    total,
    disabled,
    defaultPageSizes,
    handleSizeChange,
    handleCurrentChange,

    //Elmessage
    message,

    //data table
    initLoading,
    scoringList,
    scoringOverview,
    handleRefresh
  };
}
