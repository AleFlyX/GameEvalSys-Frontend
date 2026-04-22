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

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const toEnabled = (value) => value === true || value === 1 || value === '1';

  const getMemberCount = (group = {}) => {
    if (Array.isArray(group.memberIds)) return group.memberIds.length;
    if (Array.isArray(group.members)) return group.members.length;

    const numeric = toNumber(
      group.memberCount ?? group.membersCount ?? group.totalMembers,
      0
    );
    return Math.max(0, numeric);
  };

  const applyOverview = ({
    totalGroups = 0,
    activeGroups = 0,
    totalMembers = 0,
    avgGroupSize = 0
  }) => {
    overViewCardsMap.totalGroups = String(Math.max(0, toNumber(totalGroups)));
    overViewCardsMap.activeGroups = String(Math.max(0, toNumber(activeGroups)));
    overViewCardsMap.totalMembers = String(Math.max(0, toNumber(totalMembers)));
    overViewCardsMap.avgGroupSize = toNumber(avgGroupSize).toFixed(1);
  };

  const buildQueryParams = (pageParams = DEFAULT_PAGE_PARAMS) => ({
    ...pageParams,
    keyWords: searchKeyword.value || undefined
  });

  const extractListPage = (response) => {
    const payload = response?.data || {};
    return {
      list: payload.list || [],
      total: toNumber(payload.total)
    };
  };

  const fetchAllGroupsForOverview = async () => {
    const pageSizeForOverview = 200;
    const firstResponse = await projectGroupApi.getGroupList({ page: 1, size: pageSizeForOverview });
    const firstPage = extractListPage(firstResponse);

    const total = firstPage.total;
    const allGroups = [...firstPage.list];
    const totalPages = Math.max(1, Math.ceil(total / pageSizeForOverview));

    for (let page = 2; page <= totalPages; page += 1) {
      const pageResponse = await projectGroupApi.getGroupList({ page, size: pageSizeForOverview });
      const pageData = extractListPage(pageResponse);
      allGroups.push(...pageData.list);
    }

    return {
      groups: allGroups,
      total
    };
  };

  const buildOverviewFromListFallback = async () => {
    const { groups, total } = await fetchAllGroupsForOverview();
    const activeGroups = groups.filter((group) => toEnabled(group?.isEnabled)).length;
    const totalMembers = groups.reduce((sum, group) => sum + getMemberCount(group), 0);
    const avgGroupSize = total > 0 ? totalMembers / total : 0;

    applyOverview({
      totalGroups: total,
      activeGroups,
      totalMembers,
      avgGroupSize
    });
  };

  const loadOverview = async () => {
    try {
      const response = await projectGroupApi.getGroupOverview();
      const data = response?.data;
      if (data) {
        applyOverview({
          totalGroups: data.totalGroups ?? data.total,
          activeGroups: data.activeGroups ?? data.enabledGroups,
          totalMembers: data.totalMembers,
          avgGroupSize: data.avgGroupSize
        });
        return; // 成功获取概览数据后直接返回，不再执行后续的列表聚合逻辑
      }
    } catch {
      // overview 接口未就绪时回退到列表聚合
    }

    try {
      await buildOverviewFromListFallback();
    } catch (error) {
      console.error('Error loading group overview:', error);
    }
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
    const pageData = extractListPage(response);

    tableData.value = pageData.list;
    setTotal(pageData.total);

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

  const handleRefresh = async (responseData) => {
    if (responseData) {
      Array.isArray(responseData) ? tableData.value.unshift(...responseData) : tableData.value.unshift(responseData);
      loadOverview();
    }
    else {
      await Promise.all([
        fetchGroupList({
          page: currentPage.value,
          size: pageSize.value
        }),
        loadOverview()
      ]);
    }

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
    loadOverview,
    cancelRequest
  };
};
