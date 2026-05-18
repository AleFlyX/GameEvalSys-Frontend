<template>
  <div class="user-selection-table">
    <section class="selection-summary-panel">
      <div class="summary-item">
        <span>已选成员</span>
        <strong>{{ selectedIds.length }}</strong>
      </div>
      <div class="summary-item">
        <span>当前页已选</span>
        <strong>{{ selectedRows.length }}</strong>
      </div>
      <div class="summary-item">
        <span>搜索结果</span>
        <strong>{{ total }}</strong>
      </div>
    </section>

    <div class="toolbar-grid">
      <div class="toolbar-card">
        <div class="toolbar-label">搜索筛选</div>
        <div class="search-filter">
          <el-input v-model="searchKeyword" placeholder="搜索用户名或昵称..." clearable class="search-input"
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <search />
              </el-icon>
            </template>
          </el-input>

          <el-select v-model="selectedRole" placeholder="筛选角色" clearable class="role-select"
            @change="handleRoleFilterChange">
            <el-option v-for="role in availableRoles" :key="role.value" :label="role.label" :value="role.value" />
          </el-select>

          <el-checkbox v-model="showDisabled" @change="handleShowDisabledChange">
            显示已禁用用户
          </el-checkbox>
        </div>
      </div>

      <div class="toolbar-card toolbar-card--actions">
        <div class="toolbar-label">批量操作</div>
        <div class="batch-actions">
          <el-button size="small" type="primary" :disabled="tableData.length === 0" @click="handleSelectAll">
            全选本页
          </el-button>
          <el-button size="small" :disabled="selectedRows.length === 0" @click="handleClearSelection">
            清空本页
          </el-button>
          <el-button size="small" :disabled="selectedRows.length === 0 || tableData.length === selectedRows.length"
            @click="handleInvertSelection">
            反选本页
          </el-button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <el-table ref="tableRef" v-loading="loading" :data="tableData" row-key="id" style="width: 100%" stripe
        :reserve-selection="true" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="username" label="用户名" min-width="100" show-overflow-tooltip />
        <el-table-column prop="name" label="昵称" min-width="100" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="150" show-overflow-tooltip />
        <el-table-column label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ getRoleName(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'">
              {{ row.isEnabled ? '可用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
        :disabled="false" :total="total" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'
import { useMessage } from '@/composables/useMessage'
import { useElPagination } from '@/composables/useElPagination'

defineOptions({
  name: 'UserSelectionTable'
})

const props = defineProps({
  // 已选的用户ID列表
  selectedIds: {
    type: Array,
    default: () => []
  },
  // 允许选择的角色列表，为空表示允许所有角色
  allowedRoles: {
    type: Array,
    default: () => ['scorer', 'admin', 'super_admin']
  },
  // 是否显示已禁用的用户
  showDisabledUsers: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:selectedIds'])

const message = useMessage()
const tableRef = ref(null)

const tableData = ref([])
const searchKeyword = ref('')
const selectedRole = ref('')
const showDisabled = ref(props.showDisabledUsers)
const selectedRows = ref([])
const requestPending = ref(false)  // 防止重复请求
const isRestoringSelection = ref(false)  // 防止恢复选中时的无限循环
const isSwitchingData = ref(false)  // 切页/换筛选时，暂时屏蔽表格内部的瞬时 selection-change

// 角色映射
const roleMap = {
  super_admin: '超级管理员',
  admin: '管理员',
  scorer: '打分用户',
  normal: '普通用户'
}

const roleTagTypeMap = {
  super_admin: 'primary',
  admin: 'primary',
  scorer: 'success',
  normal: 'info'
}

// 可用角色选项
const availableRoles = computed(() => {
  return props.allowedRoles.map(role => ({
    value: role,
    label: roleMap[role] || role
  }))
})

const getRoleName = (role) => roleMap[role] || role
const getRoleTagType = (role) => roleTagTypeMap[role] || 'info'

// 分页逻辑
const {
  currentPage,
  pageSize,
  total,
  loading,
  handleSizeChange,
  handleCurrentChange,
  setTotal
} = useElPagination({
  initialPage: 1,
  initialPageSize: 10,
  defaultPageSizes: [10, 20, 30, 50],
  maxPageSize: 100,
  debounceTime: 200,
  onPageChange: async (page, size) => {
    await fetchUserList({ page, size })
  }
})

// 获取用户列表
const fetchUserList = async (pageParams = { page: 1, size: 10 }) => {
  // 防止同时发送多个请求
  if (requestPending.value) {
    return
  }

  requestPending.value = true
  isSwitchingData.value = true
  try {
    const queryParams = {
      ...pageParams,
      keyWords: searchKeyword.value.trim() || undefined,
      role: selectedRole.value || undefined,
      isEnabled: !showDisabled.value
    }

    const response = await userApi.getUserList(queryParams)
    if (response.code === 200 && response.data?.list) {
      // 过滤允许的角色
      tableData.value = response.data.list.filter(user =>
        props.allowedRoles.includes(user.role)
      )
      setTotal(response.data.total)

      // 恢复之前的选中状态
      await restoreSelectionState()
    }
  } catch (error) {
    message.error('获取用户列表失败')
    console.error('Error fetching users:', error)
  } finally {
    isSwitchingData.value = false
    requestPending.value = false
  }
}

// 恢复之前选中的用户
const restoreSelectionState = async () => {
  await nextTick()
  if (!tableRef.value) return

  isRestoringSelection.value = true
  try {
    const selectedIdSet = new Set(props.selectedIds)
    const rowsToSelect = tableData.value.filter(row => selectedIdSet.has(row.id))

    // 先清空当前页的选中，再恢复
    tableRef.value?.clearSelection?.()
    rowsToSelect.forEach(row => {
      tableRef.value?.toggleRowSelection?.(row, true)
    })
  } finally {
    isRestoringSelection.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList({ page: 1, size: pageSize.value })
}

// 角色筛选
const handleRoleFilterChange = () => {
  currentPage.value = 1
  fetchUserList({ page: 1, size: pageSize.value })
}

// 显示已禁用用户
const handleShowDisabledChange = () => {
  currentPage.value = 1
  fetchUserList({ page: 1, size: pageSize.value })
}

// 表格选中变化
const handleSelectionChange = (rows) => {
  // 恢复选中状态时不触发 emit，避免无限循环
  if (isRestoringSelection.value || isSwitchingData.value) {
    selectedRows.value = rows
    return
  }

  // 当前页选中的 ID 集合
  const currentPageSelectedIds = new Set(rows.map(row => row.id))

  // 获取当前页所有行的 ID
  const currentPageAllIds = new Set(tableData.value.map(row => row.id))

  // 其他页之前选中的 ID（不在当前页中的选中项）
  const otherPagesSelectedIds = props.selectedIds.filter(id => !currentPageAllIds.has(id))

  // 合并：当前页选中 + 其他页选中
  const newSelectedIds = [
    ...currentPageSelectedIds,
    ...otherPagesSelectedIds
  ]

  // 检查是否真的有变化
  const hasChanged = newSelectedIds.length !== props.selectedIds.length ||
    newSelectedIds.some(id => !props.selectedIds.includes(id))

  if (hasChanged) {
    selectedRows.value = rows
    emit('update:selectedIds', newSelectedIds)
  }
}

// 全选
const handleSelectAll = () => {
  tableData.value.forEach(row => {
    tableRef.value?.toggleRowSelection?.(row, true)
  })
}

// 清空选择
const handleClearSelection = async () => {
  selectedRows.value = []
  tableRef.value?.clearSelection?.()
  emit('update:selectedIds', [])
}

// 反选
const handleInvertSelection = async () => {
  await nextTick()
  tableData.value.forEach(row => {
    const isSelected = selectedRows.value.some(r => r.id === row.id)
    tableRef.value?.toggleRowSelection?.(row, !isSelected)
  })
}

// 监听 selectedIds prop 的变化 - 只恢复UI选中状态，不重新获取数据
watch(
  () => props.selectedIds,
  async () => {
    await restoreSelectionState()
  }
)

// 注意：移除了 allowedRoles 的 watch，避免频繁刷新数据

onMounted(() => {
  fetchUserList({ page: 1, size: pageSize.value })
})

defineExpose({
  refresh: () => fetchUserList({ page: currentPage.value, size: pageSize.value }),
  clearSelection: handleClearSelection
})
</script>

<style scoped>
.user-selection-table {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.selection-summary-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.summary-item span {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.summary-item strong {
  color: var(--el-text-color-primary);
  font-size: 22px;
  line-height: 1.2;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
  gap: 12px;
}

.toolbar-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.toolbar-card--actions {
  min-width: 0;
}

.toolbar-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 600;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 250px;
}

.role-select {
  width: 180px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.batch-actions :deep(.el-button) {
  margin-left: 0;
}

.batch-actions :deep(.el-button:first-child) {
  margin-left: auto;
}

.batch-actions :deep(.el-checkbox) {
  white-space: nowrap;
}

.table-container {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
  min-height: 200px;
  max-height: 360px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 2px 2px 0;
  flex-shrink: 0;
}

:deep(.el-table) {
  margin: 0;
  width: 100%;
}

/* 表格列自适应宽度 */
:deep(.el-table__header th) {
  padding: 8px 0 !important;
}

:deep(.el-table__body td) {
  padding: 8px 0 !important;
}

/* 优化分页样式 */
:deep(.el-pagination) {
  justify-content: flex-end;
}

@media (max-width: 960px) {

  .selection-summary-panel,
  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .search-input,
  .role-select {
    width: 100%;
  }

  .batch-actions :deep(.el-button:first-child) {
    margin-left: 0;
  }
}
</style>
