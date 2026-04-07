<template>
  <PagePanel>
    <template #header>
      <StatCard label="总用户数" :value="total" sub="平台用户总数" icon="User" />
      <StatCard label="管理员" :value="total" sub="管理员和超级管理员总数" icon="Avatar" />
      <StatCard label="打分用户" :value="total" sub="运行打分用户数" icon="Edit" icon-color="#66cc66" icon-bg="#e6ffe6" />
      <StatCard label="普通用户" :value="total" sub="普通不参与打分用户" icon="Collection" icon-color="#ffaa00" icon-bg="#ffeecc" />
    </template>

    <template #main-table>
      <SearchInput size="middle" placeholder="搜索用户名或姓名..." @search="handleSearch" @add="openCreateModal">
        <template #operations>
          <div class="toolbar-operations">
            <div class="select-filter">
              <el-select v-model="filterParams.role" class="role-filter" clearable placeholder="筛选角色"
                @change="handleFilterChange">
                <el-option value="" label="全部"></el-option>
                <el-option value="normal" label="普通用户"></el-option>
                <el-option value="scorer" label="打分用户"></el-option>
                <el-option value="admin" label="管理员"></el-option>
                <el-option value="super_admin" label="超级管理员"></el-option>
              </el-select>
              <el-checkbox v-model="filterParams.showDisabled" @change="handleFilterChange">
                查看被禁用用户
              </el-checkbox>
            </div>

            <div class="batch-actions">
              <span class="selection-summary">已选 {{ selectedRows.length }} 项</span>
              <el-button size="small" :disabled="selectedDisabledCount === 0" @click="handleBatchStatus(true)">
                批量启用
              </el-button>
              <el-button size="small" type="warning" :disabled="selectedEnabledCount === 0"
                @click="handleBatchStatus(false)">
                批量禁用
              </el-button>
              <el-button size="small" type="danger" :disabled="!hasSelection" @click="handleBatchDelete">
                批量删除
              </el-button>
            </div>
          </div>
        </template>
      </SearchInput>

      <el-table ref="userTableRef" v-loading="loading || batchLoading" :data="tableData" row-key="id"
        style="width: 100%;" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <DataTableColums :col-rules="columnsRules"></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="display: flex; justify-content: start;">
              操作
            </div>
          </template>
          <template #default="scope">
            <el-button size="small" @click="openEditModal(scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.isEnabled" size="small" type="danger" @click="handleStatus(false, scope.row)">
              禁用
            </el-button>
            <el-button v-else size="small" type="primary" @click="handleStatus(true, scope.row)">
              启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template #footer>
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="defaultPageSizes"
        :total="total" :disabled="disabled" layout="sizes, prev, pager, next" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <UserFormModal v-model:visible="showUserFormModal" :mode="formMode" :title="modalTitle" :init-data="handlingData"
        @refresh="handleRefresh">
      </UserFormModal>
    </template>
  </PagePanel>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import PagePanel from '@/layouts/PagePanel.vue'
import DataTableColums from '@/components/common/data/DataTableColums.vue'
import SearchInput from '@/components/common/data/SearchInput.vue'

import UserFormModal from './components/UserFormModal.vue'
import { useUserActions } from './composables/useUserActions'
import { useUserList } from './composables/useUserList'
import { useUserModal } from './composables/useUserModal'
import { useMessage } from '@/composables/useMessage'
import { showMsgBox } from '@/utils/ConfirmBox'
import { columnsRules } from './config/data-table/dataTableColumnsRule'

defineOptions({
  name: 'AdminUserPage'
})

const message = useMessage()

const {
  batchLoading,
  changeUserStatus,
  batchChangeUserStatus,
  batchDeleteUsers
} = useUserActions();

const {
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
  cancelRequest
} = useUserList()

const {
  showUserFormModal,
  formMode,
  handlingData,
  modalTitle,
  openCreateModal,
  openEditModal
} = useUserModal()

const userTableRef = ref(null)
const selectedRows = ref([])

// 被选中的行
const hasSelection = computed(() => selectedRows.value.length > 0)
// 存在已启用的用户数
const selectedEnabledCount = computed(() => selectedRows.value.filter((item) => item.isEnabled).length)
// 存在被禁用的用户数
const selectedDisabledCount = computed(() => selectedRows.value.length - selectedEnabledCount.value)

const clearSelection = async () => {
  selectedRows.value = []
  await nextTick()
  userTableRef.value?.clearSelection?.()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const formatBatchResultMessage = (actionText, result) => {
  const parts = [`成功 ${result.successCount} 项`]

  if (typeof result.skippedCount === 'number' && result.skippedCount > 0) {
    parts.push(`跳过 ${result.skippedCount} 项`)
  }
  if (result.failCount > 0) {
    parts.push(`失败 ${result.failCount} 项`)
  }

  const type = result.failCount > 0 ? 'warning' : 'success'
  message.showMessage({
    type,
    message: `${actionText}完成，${parts.join('，')}`,
    duration: result.failCount > 0 ? 4000 : 3000
  })
}

const handleStatus = async (status, row) => {
  try {
    await changeUserStatus(status, row)
    await handleRefresh()
    message.success('操作成功')
  } catch (err) {
    message.error(`操作失败: ${err}`)
  }
}

const handleBatchStatus = async (status) => {
  const actionText = status ? '批量启用' : '批量禁用'
  const targetCount = status ? selectedDisabledCount.value : selectedEnabledCount.value

  if (!hasSelection.value) {
    message.warning('请先选择需要操作的用户')
    return
  }

  if (targetCount === 0) {
    message.info(`当前选中用户无需${status ? '启用' : '禁用'}`)
    return
  }

  try {
    await showMsgBox(
      actionText,
      `确认${status ? '启用' : '禁用'}选中的 ${targetCount} 个用户吗？`,
      { type: status ? 'primary' : 'danger' }
    )
    const result = await batchChangeUserStatus(status, selectedRows.value)
    await handleRefresh()
    formatBatchResultMessage(actionText, result)
  } catch (err) {
    if (err !== 'cancel') {
      message.error(`${actionText}失败: ${err}`)
    }
  }
}

const handleBatchDelete = async () => {
  if (!hasSelection.value) {
    message.warning('请先选择需要删除的用户')
    return
  }

  try {
    await showMsgBox(
      '批量删除用户',
      `确认删除选中的 ${selectedRows.value.length} 个用户吗？删除后无法恢复。`,
      { type: 'danger' }
    )
    const result = await batchDeleteUsers(selectedRows.value)
    await handleRefresh()
    formatBatchResultMessage('批量删除', result)
  } catch (err) {
    if (err !== 'cancel') {
      message.error(`批量删除失败: ${err}`)
    }
  }
}

watch(tableData, async () => {
  await clearSelection()
})

onMounted(() => {
  handleRefresh()
})

onBeforeUnmount(() => {
  cancelRequest()
})
</script>

<style scoped>
.select-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-operations {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.selection-summary {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.role-filter {
  width: 180px;
}
</style>
