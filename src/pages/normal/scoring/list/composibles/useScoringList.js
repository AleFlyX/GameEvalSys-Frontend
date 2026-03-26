import { ref, onMounted } from 'vue';
import { projectApi } from '@/api/project';
import { useMessage } from '@/composables/useMessage';
import { useElPagination } from '@/composables/useElPagination';

/**
 * 获取数据、分页操作
 * @return {Object} 暴露给入口页的方法和变量
 */
export const useScoringList = () => {

  const message = useMessage();
  const scoringList = ref([]);

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
  // 获取打分项目列表
  const fetchScoringProjects = async (params = { page: 1, size: 10 }) => {
    try {
      disabled.value = true;
      const response = await projectApi.getAuthorizedProjectList(params)
      console.log(response.data)
      scoringList.value = response.data.list || [];
      total.value = response.data.total || 0;
      // 计算统计数据
      // calculateStats();

    } catch (error) {
      message.error('获取项目列表失败: ' + error);
      console.error('Error fetching projects:', error);
    } finally {
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
    scoringList,
    handleRefresh
  };
}
