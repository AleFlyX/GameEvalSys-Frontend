import { reactive, ref } from 'vue'

import { userApi } from '@/api/user'
import { useElPagination } from '@/composables/useElPagination'
import { useMessage } from '@/composables/useMessage'

/**
 * 列表数据、筛选、分页、刷新
 * @returns
 */
export function useUserList() {
  const message = useMessage()

  const tableData = ref([])
  const keyword = ref('')
  const filterParams = reactive({
    role: '',
    showDisabled: false
  })

  const buildQueryParams = (pageParams = { page: 1, size: 10 }) => {
    return {
      ...pageParams,
      role: filterParams.role || undefined,
      keyWords: keyword.value || undefined,
      isEnabled: !filterParams.showDisabled
    }
  }

  const getUserDataList = async (pageParams = { page: 1, size: 10 }) => {
    try {
      const response = await userApi.getUserList(buildQueryParams(pageParams))
      tableData.value = response.data.list
      setTotal(response.data.total)
      return response
    } catch (error) {
      message.error(error)
      throw error
    }
  }

  const {
    currentPage,
    pageSize,
    total,
    disabled,
    defaultPageSizes,
    loading,
    handleSizeChange,
    handleCurrentChange,
    setTotal,
    cancelRequest
  } = useElPagination({
    initialPage: 1,
    initialPageSize: 10,
    defaultPageSizes: [10, 20, 50],
    maxPageSize: 100,
    debounceTime: 200,
    onPageChange: async (page, size) => {
      await getUserDataList({ page, size })
    }
  })

  const queryFirstPage = async () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }

    await getUserDataList({
      page: 1,
      size: pageSize.value
    })
  }

  const handleSearch = async (keywords = '') => {
    keyword.value = keywords.trim()
    await queryFirstPage()
  }

  const handleFilterChange = async () => {
    await queryFirstPage()
  }

  const handleRefresh = async () => {
    await getUserDataList({
      page: currentPage.value,
      size: pageSize.value
    })
  }

  return {
    currentPage,
    pageSize,
    total,
    disabled,
    defaultPageSizes,
    loading,
    tableData,
    filterParams,
    handleSearch,
    handleFilterChange,
    handleRefresh,
    handleSizeChange,
    handleCurrentChange,
    getUserDataList,
    cancelRequest
  }
}
