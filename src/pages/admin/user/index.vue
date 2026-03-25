<template>
  <PagePanel>
    <template #header>
      <OverviewCard icon="User" title="总用户数" :data="total"></OverviewCard>
      <OverviewCard icon="Avatar" title="管理员" data="22"></OverviewCard>
      <OverviewCard icon="Edit" icon-color="#66cc66" icon-background="#e6ffe6" title="打分用户" data="13"></OverviewCard>
      <OverviewCard icon="Collection" icon-color="#ffaa00" icon-background="#ffeecc" title="普通用户" data="1">
      </OverviewCard>
    </template>

    <template #main-table>
      <SearchInput size="middle" placeholder="搜索用户名或姓名..." @search="handleSearch" @add="openCreateModal">
        <template #operations>
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
        </template>
      </SearchInput>

      <el-table v-loading="loading" :data="tableData" style="width: 100%;" stripe>
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
import { onBeforeUnmount, onMounted } from 'vue'

import PagePanel from '@/layouts/PagePanel.vue'
import OverviewCard from '@/components/common/data/OverviewCard.vue'
import DataTableColums from '@/components/common/data/DataTableColums.vue'
import SearchInput from '@/components/common/data/SearchInput.vue'

import UserFormModal from './components/UserFormModal.vue'
import { useUserActions } from './composables/useUserActions'
import { useUserList } from './composables/useUserList'
import { useUserModal } from './composables/useUserModal'
import { useMessage } from '@/composables/useMessage'
import { columnsRules } from './utils/dataTableColumnsRule'

const message = useMessage()
const { changeUserStatus } = useUserActions()
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

const handleStatus = async (status, row) => {
  try {
    await changeUserStatus(status, row)
    await handleRefresh()
    message.success('操作成功')
  } catch (err) {
    message.error(`操作失败: ${err}`)
  }
}

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

.role-filter {
  width: 180px;
}
</style>
