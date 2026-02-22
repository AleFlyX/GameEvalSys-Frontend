<template>
  <div class="user-list">
    <div style="display: flex; width: 100%; ">
      <OverviewCard icon="User" title="总用户数" data="235"></OverviewCard>
      <OverviewCard icon="Avatar" title="管理员" data="22"></OverviewCard>
      <OverviewCard icon="Edit" icon-color="#66cc66" icon-background="#e6ffe6" title="打分用户" data="13"></OverviewCard>
      <OverviewCard icon="Collection" icon-color="#ffaa00" icon-background="#ffeecc" title="普通用户" data="1">
      </OverviewCard>
    </div>
    <!-- <TestCard width="30%"></TestCard> -->
    <div style="width: 100%; display: flex; justify-content: flex-start;">
      <SearchInput size="middle" @search="handleSearch" @add="handleAdd"></SearchInput>
    </div>

    <div class="data-list">
      <el-table :data="tableData" style="width: 100%;" stripe>
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
            <el-button v-if="scope.row.isEnabled" size="small" type="danger" @click="handleDeactive(scope.row)">
              禁用
            </el-button>
            <el-button v-if="!scope.row.isEnabled" size="small" type="primary" @click="handleActive(scope.row)">
              启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
          :page-sizes="[10, 20, 30]" size="middle" :disabled="pagenationDisabled" :total="totalData"
          @size-change="handleSizeChange" layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
      </div>
    </div>

  </div>
  <!-- <UserFormModal :visible="showUserAddDialog" @close="showUserAddDialog = false">parent
    <template #test>aatest</template>
  </UserFormModal> -->

  <!-- 确认删除/停用 -->
  <UserConfirm v-model:visible="showUserConfirmDialog" :data="handlingData" :disable-btn="disableConfirmBtn"
    @confirm="handleConfirm" :title="confirmDialogTitle">
  </UserConfirm>

  <UserEdit v-model:visible="showEditUserDialog" :data="handlingData" @refresh="handleRefresh"></UserEdit>

  <UserAdd v-model:visible="showUserAddDialog" @refresh="handleRefresh"></UserAdd>
  <button @click="showUserAddDialog = !showUserAddDialog">UserAdd</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import OverviewCard from '@/components/common/data/OverviewCard.vue'
import DataTableColums from '@/components/common/data/DataTableColums.vue'
import SearchInput from '@/components/common/data/SearchInput.vue'

import UserConfirm from '@/pages/admin/user/components/UserConfirm.vue'
import UserAdd from './components/UserAdd.vue'
import UserEdit from './components/UserEdit.vue'

import { userApi } from '@/api/user'
import { columnsRules } from '@/pages/admin/user/utils/dataTableColumnsRule'

const handlingData = ref({})

const showEditUserDialog = ref(false);
const handleEdit = (index, row) => {
  showEditUserDialog.value = true;
  handlingData.value = row;
  console.log(index, row)
  // console.log('reactive', handlingData.value)
}

const showUserConfirmDialog = ref(false);
const confirmDialogTitle = ref('')
const disableConfirmBtn = ref(false)

const handleDeactive = (row) => {
  console.log('handling deactive', row)
  handlingData.value = row;
  confirmDialogTitle.value = '是否禁用？';
  showUserConfirmDialog.value = true;
  // console.log(handlingData)
}

const handleConfirm = (event) => {
  ElMessage.info(`确认事件${event}`)
  console.log('Confirm event', event)
}

/**
 * 禁用用户
 * @param userId 用户ID
 */
const deactiveUser = async (userId) => {
  ElMessage.info(`正在禁用用户ID${userId}`);
  // console.log('正在禁用用户ID', userId)
  disableConfirmBtn.value = true;
  try {
    const response = await userApi.deactiveUser(userId)
    ElMessage.success(response.message)
  }
  catch (err) {
    ElMessage.error(err)
    console.log(err)
  }
  finally {
    handlingData.value = {}
    disableConfirmBtn.value = false;
  }
}
const handleActive = () => {

}
const handleDelete = (index, row) => {
  console.log(index, row)
  handlingData.value.name = row.name;
  handlingData.value.id = row.id;
  showUserConfirmDialog.value = true;
}

const showUserAddDialog = ref(false)
const handleAdd = () => {
  showUserAddDialog.value = !showUserAddDialog.value;
  console.log('user aDD', showUserAddDialog.value)
}

const tableData = ref([
  {
    id: 131231,
    username: "admin2323",
    role: "super_admin",
    name: "超级管理员",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1331,
    username: "sxc258",
    role: "admin",
    name: "孙笑川258",
    isEnabled: false,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1455,
    username: "lol333",
    name: "SpringBoot",
    role: "scorer",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1567,
    username: "vue",
    name: "VueNormal",
    role: "normal",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1998,
    username: "HTML",
    name: "超级员",
    role: "normal",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 17875,
    username: "ccb",
    name: "超级管",
    role: "scorer",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  }
])

const handleSearch = async (keywords) => {
  console.log('parent recv', keywords)
  try {
    tableData.value = await userApi.getRelateSearchUser(keywords);
  } catch (error) {
    console.log(error)
  }
}


const pagenationDisabled = ref(false);
const totalData = ref(100);
const pageParams = ref({
  page: 1,
  size: 10
});

const handleSizeChange = (val) => {
  // console.log('pagesize CHANGE', val)
  pageParams.value.size = val;
  getUserDataList(pageParams.value);
}

const handleCurrentChange = (val) => {
  // console.log('page CHANGE', val)
  pageParams.value.page = val;
  getUserDataList(pageParams.value);
}

const handleRefresh = () => {
  getUserDataList()
}

const getUserDataList = async (pageParams = { page: 1, size: 10 }) => {
  try {
    tableData.value = await userApi.getUserList(pageParams)
    ElMessage.success('用户数据获取成功')
    return Promise.resolve();
  } catch (error) {
    ElMessage.error(error)
    return Promise.reject(error);
  }
}

onMounted(() => {
  getUserDataList(pageParams.value);
})
</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px
}

.data-list {
  width: 99%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0px 2px 8px gray;
  border-radius: 15px;

}

.pagination {
  width: 99%;
  display: flex;

  justify-content: center;
}
</style>
