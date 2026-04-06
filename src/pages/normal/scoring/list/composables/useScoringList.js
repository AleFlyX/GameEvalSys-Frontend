import { ref, onMounted } from 'vue';
import { projectApi } from '@/api/project';
import { useProjectStore } from '@/stores/modules/projectStore';
import { useLoading } from '@/composables/useLodaing';
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
  const scoringList = ref([{ id: 2 }]);

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
  // 获取打分项目列表
  const fetchScoringProjects = async (params = { page: 1, size: 10 }) => {
    StartInit();
    try {
      disabled.value = true;

      const response = await projectApi.getAuthorizedProjectList(params)
      console.log(response.data)
      scoringList.value = response.data.list || [];
      total.value = response.data.total || 0;

      // 仅在关键字段完整时预热缓存，避免把缺失字段的数据写进详情缓存
      scoringList.value.forEach((projectItem) => {
        const hasProjectId = Number.isFinite(Number(projectItem?.id));
        const hasStandardId = Number.isFinite(Number(projectItem?.standardId));
        if (hasProjectId && hasStandardId) {
          projectStore.setProjectDetails(projectItem);
        }
      });
      // 计算统计数据
      // calculateStats();

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
  });
  // 刷新列表
  const handleRefresh = () => {
    fetchScoringProjects();
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
    handleRefresh
  };
}
