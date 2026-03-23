// src/composables/useElPagination.js
import { ref, computed, watch, unref } from 'vue'

export function useElPagination(options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    defaultPageSizes = [10, 20, 30, 50],
    maxPageSize = 100,
    onPageChange = async () => { },
    debounceTime = 300 // 防抖时间
  } = options

  // 基础状态
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  // loading 控制
  const loading = ref(false)

  // 分页禁用 = loading 或 无数据
  const disabled = computed(() => loading.value || total.value === 0)

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
    return function (...args) {
      let context = this;//保存上下文this指向
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(context, ...args)// 绑定this到原函数，还原指向
      }, delay)
    }
  }

  // 核心请求触发函数
  const triggerRequest = async (page, size) => {
    // 取消上一次请求
    cancelRequest()

    controller = new AbortController()

    loading.value = true

    try {
      await onPageChange(page, size, controller.signal)
    } catch (err) {
      // 忽略主动取消
      if (err.name !== 'AbortError') {
        console.error('分页请求错误:', err)
      }
    } finally {
      loading.value = false
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
