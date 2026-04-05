import { reactive, ref } from 'vue';
import { useElPagination } from '@/composables/useElPagination';
import { projectGroupApi } from '@/api/project-group';

const DEFAULT_PAGE_PARAMS = { page: 1, size: 10 };

export const useProjectGroupData = () => {
  const tableData = ref([]);
  const searchKeyword = ref('');

  const overViewCardsMap = reactive({
    totalGroups: '0',
    activeGroups: '0',
    totalMembers: '0',
    avgGroupSize: '0'
  });

  const buildQueryParams = (pageParams = DEFAULT_PAGE_PARAMS) => ({
    ...pageParams,
    keyWords: searchKeyword.value || undefined
  });

  const calculateStats = (total = 0) => {
    if (!tableData.value?.length) {
      overViewCardsMap.totalGroups = '0';
      overViewCardsMap.activeGroups = '0';
      overViewCardsMap.totalMembers = '0';
      overViewCardsMap.avgGroupSize = '0';
      return;
    }

    const activeCount = tableData.value.filter(group => group.isEnabled).length;
    const totalMembers = tableData.value.reduce((sum, group) => sum + (group.memberIds?.length || 0), 0);
    const avgSize = (totalMembers / tableData.value.length).toFixed(1);

    overViewCardsMap.totalGroups = String(total);
    overViewCardsMap.activeGroups = String(activeCount);
    overViewCardsMap.totalMembers = String(totalMembers);
    overViewCardsMap.avgGroupSize = avgSize;
  };

  const {
    currentPage,
    pageSize,
    total,
    loading,
    disabled,
    defaultPageSizes,
    handleSizeChange,
    handleCurrentChange,
    setTotal,
    cancelRequest
  } = useElPagination({
    initialPage: DEFAULT_PAGE_PARAMS.page,
    initialPageSize: DEFAULT_PAGE_PARAMS.size,
    defaultPageSizes: [10, 20, 30],
    debounceTime: 200,
    onPageChange: async (page, size) => {
      await fetchGroupList({ page, size });
    }
  });

  async function fetchGroupList(pageParams = DEFAULT_PAGE_PARAMS) {
    const response = await projectGroupApi.getGroupList(buildQueryParams(pageParams));
    const data = response?.data || {};
    const list = data?.list || [];
    const totalCount = Number(data?.total) || 0;

    tableData.value = list;
    setTotal(totalCount);
    calculateStats(totalCount);

    return response;
  }

  const queryFirstPage = async () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1;
      return;
    }

    await fetchGroupList({
      page: 1,
      size: pageSize.value
    });
  };

  const handleSearch = async (keywords = '') => {
    searchKeyword.value = keywords.trim();
    await queryFirstPage();
  };

  const handleRefresh = async () => {
    await fetchGroupList({
      page: currentPage.value,
      size: pageSize.value
    });
  };

  return {
    currentPage,
    pageSize,
    total,
    loading,
    disabled,
    defaultPageSizes,
    overViewCardsMap,
    tableData,
    searchKeyword,
    handleSearch,
    handleRefresh,
    handleSizeChange,
    handleCurrentChange,
    fetchGroupList,
    cancelRequest
  };
};
