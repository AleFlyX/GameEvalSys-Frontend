import { ref, computed, onMounted } from 'vue';
import { reviewerGroupApi } from '@/api/reviewer-group';
import { useElPagination } from '@/composables/useElPagination';
import { useMessage } from '@/composables/useMessage';
import { useLoading } from '@/composables/useLodaing';

/**
 * 评审组列表数据管理
 * @returns {Object} 列表数据和操作方法
 */
export const useReviewerGroupList = () => {
  const message = useMessage();
  const searchKeyword = ref('');
  const tableData = ref([]);
  const totalData = ref(0);

  // 统计数据
  const overViewCardsMap = computed(() => {
    if (!tableData.value || tableData.value.length === 0) {
      return {
        totalGroups: '0',
        activeGroups: '0',
        totalMembers: '0',
        avgGroupSize: '0'
      };
    }

    const activeCount = tableData.value.filter(g => g.isEnabled).length;
    const totalMembers = tableData.value.reduce((sum, g) => sum + (g.memberIds?.length || 0), 0);
    const avgSize = tableData.value.length > 0 ? (totalMembers / tableData.value.length).toFixed(1) : '0';

    return {
      totalGroups: String(totalData.value),
      activeGroups: String(activeCount),
      totalMembers: String(totalMembers),
      avgGroupSize: avgSize
    };
  });

  // 分页配置
  const {
    currentPage,
    pageSize,
    disabled: paginationDisabled,
    handleSizeChange,
    handleCurrentChange,
    setTotal,
  } = useElPagination({
    initialPage: 1,
    initialPageSize: 10,
    defaultPageSizes: [10, 20, 30],
    onPageChange: async (page, size) => {
      console.log('分页变化:', page, size);
      await fetchGroupList({ page, size });
    }
  });

  // loading 管理
  const { isLoading, requestWithLoading } = useLoading('reviewerGroupList');

  // 获取评审组列表
  const fetchGroupList = async (params = { page: 1, size: 10 }) => {
    try {
      const response = await requestWithLoading(
        () => reviewerGroupApi.getReviewerGroupList(params)
      );
      console.log('API响应:', response);

      if (response.code === 200 && response.data) {
        // 兼容两种数据格式：直接数组 或 {list, total}
        const data = response.data;
        if (Array.isArray(data)) {
          tableData.value = data;
          // 如果是数组直接返回，总数从分页信息获取
          totalData.value = response.total || data.length;
        } else if (data.list) {
          tableData.value = data.list;
          totalData.value = data.total || 0;
        } else {
          tableData.value = [];
          totalData.value = 0;
        }
        // 重要：更新分页组件的total值，否则分页会一直disabled
        setTotal(totalData.value);
        console.log('表格数据:', tableData.value, '总数:', totalData.value);
      }
    } catch (error) {
      message.error('获取评审组列表失败: ' + error);
      console.error('Error fetching group list:', error);
    }
  };

  // 搜索处理
  const handleSearch = (keyword) => {
    searchKeyword.value = keyword;
    currentPage.value = 1;
    fetchGroupList({
      page: 1,
      size: pageSize.value,
      keyWords: keyword || undefined
    });
  };

  // 刷新列表
  const handleRefresh = async () => {
    await fetchGroupList({
      page: currentPage.value,
      size: pageSize.value,
      keyWord: searchKeyword.value || undefined
    });
  };

  // 初始化数据
  onMounted(() => {
    console.log('useReviewerGroupList onMounted 初始化');
    fetchGroupList({
      page: currentPage.value,
      size: pageSize.value
    });
  });

  return {
    // 列表数据
    tableData,
    totalData,
    overViewCardsMap,
    searchKeyword,

    // 分页
    currentPage,
    pageSize,
    paginationDisabled,
    handleSizeChange,
    handleCurrentChange,

    // 操作
    isLoading,
    handleSearch,
    handleRefresh,
    fetchGroupList
  };
};
