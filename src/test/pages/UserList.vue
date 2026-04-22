<template>
  <PagePanel>
    <template #header>
      <OverviewCard icon="User" title="总用户数" :data="total"></OverviewCard>
      <OverviewCard icon="Avatar" title="管理员" data="22"></OverviewCard>
      <OverviewCard icon="Edit" icon-color="#66cc66" icon-background="#e6ffe6" title="打分用户" data="13"></OverviewCard>
      <OverviewCard icon="Collection" icon-color="#ffaa00" icon-background="#ffeecc" title="普通用户" data="1">
      </OverviewCard>
    </template>

    <!-- <TestCard width="30%"></TestCard> -->


    <template #main-table>
      <SearchInput size="middle" placeholder="搜索用户名或姓名..." @search="handleSearch" @add="handleAdd">
        <template #operations>
          <div class="select-filter">
            <el-select v-model="filterParams.role" class="role-filter" clearable placeholder="筛选角色"
              @change="handleFilterChange">
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
        <DataTableColums :col-rules=columnsRules></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="display: flex; justify-content: start;">
              操作
            </div>
          </template>
          <template #default="scope">
            <!-- 删除用户移至编辑界面内 -->
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.isEnabled" size="small" type="danger" @click="handleStatus(false, scope.row)">
              禁用
            </el-button>
            <el-button v-if="!scope.row.isEnabled" size="small" type="primary" @click="handleStatus(true, scope.row)">
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
      <UserEdit v-model:visible="showEditUserDialog" :initData="handlingData" @refresh="handleRefresh"></UserEdit>

      <UserAdd v-model:visible="showUserAddDialog" @refresh="handleRefresh"></UserAdd>
    </template>
  </PagePanel>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useMessage } from '@/composables/useMessage'
import { useElPagination } from '@/composables/useElPagination'
// import TestCard from './components/testCard.vue'
import PagePanel from '@/layouts/PagePanel.vue'
import OverviewCard from '@/components/common/data/OverviewCard.vue'
import DataTableColums from '@/components/common/data/DataTableColums.vue'
import SearchInput from '@/components/common/data/SearchInput.vue'

import UserAdd from './components/UserAdd.vue'
import UserEdit from './components/UserEdit.vue'

import { userApi } from '@/api/user'

import { columnsRules } from '@/pages/admin/user/utils/data-table/dataTableColumnsRule'
import { showDisableUserConfirm } from './composables/userConfirm'

const message = useMessage();//Elmessage 通用组合式函数
const { //结构以防止ref被ref嵌套，保证每个接受到的ref响应式变量不是在一个对象中被访问
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
});//Elpagination 分页逻辑组合式函数

const handlingData = ref({})

const showEditUserDialog = ref(false);
const handleEdit = (index, row) => {
  showEditUserDialog.value = true;
  handlingData.value = row;
  console.log(index, row)
  // console.log('reactive', handlingData.value)
}

const handleStatus = async (status, row) => {
  console.log('handling deactive', { ...row, isEnabled: status })
  try {
    await showDisableUserConfirm({ ...row, isEnabled: status })
    await getUserDataList({
      page: currentPage.value,
      size: pageSize.value
    })
    message.success('操作成功')
    return Promise.resolve();
  } catch (err) {
    message.error(`操作失败: ${err}`);
  }
  // handlingData.value = row;
  // console.log(handlingData)
}

const showUserAddDialog = ref(false)
const handleAdd = () => {
  showUserAddDialog.value = !showUserAddDialog.value;
  console.log('user aDD', showUserAddDialog.value)
}

const tableData = ref([])
const filterParams = reactive({
  role: '',
  showDisabled: false
});

const keyword = ref('')

const buildQueryParams = (pageParams = { page: 1, size: 10 }) => {
  return {
    ...pageParams,
    role: filterParams.role || undefined,
    keyWords: keyword.value || undefined,
    isEnabled: !filterParams.showDisabled
  }
}

const handleSearch = async (keywords = '') => {
  keyword.value = keywords.trim()
  if (currentPage.value !== 1) {
    currentPage.value = 1
    return
  }
  await getUserDataList({ page: 1, size: pageSize.value })
}

const handleFilterChange = async () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
    return
  }
  await getUserDataList({ page: 1, size: pageSize.value })
}

const getUserDataList = async (pageParams = { page: 1, size: 10 }) => {
  try {
    const response = await userApi.getUserList(buildQueryParams(pageParams));
    tableData.value = response.data.list;

    setTotal(response.data.total);
    // message.success('用户数据获取成功')
    return Promise.resolve();
  } catch (error) {
    message.error(error)
    return Promise.reject(error);
  }
}

const handleRefresh = () => {
  getUserDataList({
    page: currentPage.value,
    size: pageSize.value
  })
}

onMounted(() => {
  getUserDataList({
    page: currentPage.value,
    size: pageSize.value
  });
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
