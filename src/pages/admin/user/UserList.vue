<template>
  <div class="user-list">
    <div style="display: flex; width: 100%; ">
      <OverviewCard icon="User" title="总用户数" data="235"></OverviewCard>
      <OverviewCard icon="Avatar" title="管理员" data="22"></OverviewCard>
      <OverviewCard icon="Edit" icon-color="#66cc66" icon-background="#e6ffe6" title="打分用户" data="13"></OverviewCard>
      <OverviewCard icon="Collection" icon-color="#ffaa00" icon-background="#ffeecc" title="普通用户" data="1">
      </OverviewCard>
    </div>
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
              <!-- <el-input v-model="search" size="small" placeholder="Type to search" />
              <el-button>查找</el-button>
              <el-button>添加</el-button> -->
            </div>
          </template>
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column>
        </el-table-column> -->
      </el-table>
      <div class="pagination">
        <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
          :page-sizes="[10, 20, 30]" size="middle" :disabled="pagenationDisabled" :total="totalData"
          @size-change="handleSizeChange" layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
        <!-- <PaginationBar></PaginationBar> -->
      </div>
    </div>

  </div>
  <UserFormModal :visible="showUserAddDialog" @close="showUserAddDialog = false">parent
    <template #test>aatest</template>
  </UserFormModal>
  <ConfirmModal v-if="showDeleteUserDialog" @confirm-delete="handleConfirmDelete()"
    @close="showDeleteUserDialog = false" :data="waitToDelete"></ConfirmModal>
  <!-- <button @click="showUserAddDialog = !showUserAddDialog">show</button> -->
</template>

<script setup>
// import PaginationBar from '@/components/common/PaginationBar.vue'
import OverviewCard from '@/components/common/data/OverviewCard.vue'
import DataTableColums from '@/components/common/data/DataTableColums.vue'
import SearchInput from '@/components/common/data/SearchInput.vue'
import UserFormModal from './components/UserFormModal.vue'
import ConfirmModal from '@/components/common/modal/ConfirmModal.vue'

import { userApi } from '@/api/user'
import { columnsRules } from '@/pages/admin/user/utils/dataTableColumnsRule'

import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const showEditUserDialog = ref(false);
const handleEdit = (index, row) => {
  console.log(index, row)
}

const showDeleteUserDialog = ref(false);
const waitToDelete = ref({
  name: '',
  id: ''
})
const handleDelete = (index, row) => {
  console.log(index, row)
  showDeleteUserDialog.value = true;
  waitToDelete.value.name = row.name;
  waitToDelete.value.id = row.id;
}
const handleConfirmDelete = (row) => {
  showDeleteUserDialog.value = false;
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
  getUserData(pageParams.value);
}

const handleCurrentChange = (val) => {
  // console.log('page CHANGE', val)
  pageParams.value.page = val;
  getUserData(pageParams.value);
}

const getUserData = async (pageParams) => {
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
  getUserData(pageParams.value);
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
