import { ref, computed, watch, unref } from 'vue'
import { useLoading } from '@/composables/useLoading'

/**
 * 基于El pagination的组合式函数
 * @param {Object} options 要初始化的参数
 * @param {Number} options.initialPage 初始页
 * @param {Number}options.initialPageSize 初始的分页大小
 * @param {Array}options.defaultPageSizes 可调整的分页大小
 * @param {Number}options.maxPageSize 最大分页大小
 * @param {Function}options.onPageChange 页变化时触发的回调函数
 * @param {Number}options.debounceTime 回调函数执行的防抖时间
 * @returns {Object} 要暴露的方法和变量
 */
export function useElPagination(options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    defaultPageSizes = [10, 20, 30, 50],
    maxPageSize = 100,
    onPageChange = async () => { },
    debounceTime = 300, // 防抖时间
    loadingKey
  } = options

  // 基础状态
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  // loading 控制
  const resolvedLoadingKey = loadingKey || `pagination:${Math.random().toString(36).slice(2, 10)}`
  const { isLoading: loading, start: startLoading, end: endLoading } = useLoading(resolvedLoadingKey)

  // 分页禁用 = loading 或 无数据
  const disabled = computed(() => loading.value || total.value === 0)

  // 总页数（一般El pagination会根据 总数据数量 自行计算）
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize.value))
  )


  // AbortController（请求取消）
  let controller = null

  const cancelRequest = () => {
    if (controller) {
      controller.abort()
      controller = null
    }
  }

  // 防抖
  let timer = null

  const debounce = (fn, delay) => {
    return (...args) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }

  // 核心请求触发函数
  const triggerRequest = async (page, size) => {
    // 取消上一次请求
    cancelRequest()

    controller = new AbortController()

    startLoading()

    try {
      await onPageChange(page, size, controller.signal)
    } catch (err) {
      // 忽略主动取消
      if (err.name !== 'AbortError') {
        console.error('分页请求错误:', err)
      }
    } finally {
      endLoading()
    }
  }

  const debouncedTrigger = debounce(triggerRequest, debounceTime)

  // 分页逻辑
  function setTotal(count) {
    total.value = Number(count) || 0

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }

  function setCurrentPage(page) {
    currentPage.value = Math.min(
      Math.max(1, Number(page) || 1),
      totalPages.value
    )
  }

  function setPageSize(size) {
    pageSize.value = Math.min(
      Math.max(1, Number(size) || initialPageSize),
      maxPageSize
    )
    currentPage.value = 1
  }

  function resetPagination() {
    currentPage.value = initialPage
    pageSize.value = initialPageSize
  }

  // 自动监听（核心）
  watch(
    [currentPage, pageSize],
    ([page, size], [oldPage, oldSize]) => {
      if (page !== oldPage || size !== oldSize) {
        debouncedTrigger(unref(page), unref(size))
      }
    },
    { flush: 'post' }
  )

  return {
    // 状态
    currentPage,
    pageSize,
    total,
    loading,
    disabled,

    totalPages,
    defaultPageSizes,

    // 方法
    setTotal,
    setCurrentPage,
    setPageSize,
    resetPagination,
    cancelRequest, // 手动取消请求

    // el-pagination 事件适配
    handleSizeChange: setPageSize,
    handleCurrentChange: setCurrentPage
  }
}
