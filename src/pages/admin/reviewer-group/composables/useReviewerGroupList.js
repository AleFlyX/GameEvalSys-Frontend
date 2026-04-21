import { ref, reactive, onMounted } from 'vue';
import { reviewerGroupApi } from '@/api/reviewer-group';
import { useElPagination } from '@/composables/useElPagination';
import { useMessage } from '@/composables/useMessage';
import { useLoading } from '@/composables/useLoading';

/**
 * 评审组列表数据管理
 * @returns {Object} 列表数据和操作方法
 */
export const useReviewerGroupList = () => {
  const message = useMessage();
  const searchKeyword = ref('');
  const tableData = ref([]);
  const totalData = ref(0);

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

  const extractListPage = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) {
      return {
        list: payload,
        total: toNumber(response?.total ?? payload.length)
      };
    }

    return {
      list: payload?.list || [],
      total: toNumber(payload?.total)
    };
  };

  const fetchAllGroupsForOverview = async () => {
    const pageSizeForOverview = 200;
    const firstPageResponse = await reviewerGroupApi.getReviewerGroupList({ page: 1, size: pageSizeForOverview });
    const firstPage = extractListPage(firstPageResponse);

    const total = firstPage.total;
    const allGroups = [...firstPage.list];
    const totalPages = Math.max(1, Math.ceil(total / pageSizeForOverview));

    for (let page = 2; page <= totalPages; page += 1) {
      const pageResponse = await reviewerGroupApi.getReviewerGroupList({ page, size: pageSizeForOverview });
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
      const response = await reviewerGroupApi.getReviewerGroupOverview();
      const data = response?.data;
      if (data) {
        applyOverview({
          totalGroups: data.totalGroups ?? data.total,
          activeGroups: data.activeGroups ?? data.enabledGroups,
          totalMembers: data.totalMembers,
          avgGroupSize: data.avgGroupSize
        });
        return;
      }
    } catch {
      // overview 接口未就绪时回退到列表聚合
    }

    try {
      await buildOverviewFromListFallback();
    } catch (error) {
      console.error('Error loading reviewer group overview:', error);
    }
  };

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
        const pageData = extractListPage(response);
        tableData.value = pageData.list;
        totalData.value = pageData.total;
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
    await Promise.all([
      fetchGroupList({
        page: currentPage.value,
        size: pageSize.value,
        keyWords: searchKeyword.value || undefined
      }),
      loadOverview()
    ]);
  };

  // 初始化数据
  onMounted(() => {
    console.log('useReviewerGroupList onMounted 初始化');
    Promise.all([
      fetchGroupList({
        page: currentPage.value,
        size: pageSize.value
      }),
      loadOverview()
    ]);
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
