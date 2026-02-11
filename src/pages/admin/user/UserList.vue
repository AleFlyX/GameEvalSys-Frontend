<template>
  <div class="user-list">
    <div style="display: flex; width: 100%; ">
      <OverviewCard icon="User" title="总用户数" data="235"></OverviewCard>
      <OverviewCard icon="Avatar" title="管理员" data="22"></OverviewCard>
      <OverviewCard icon="Edit" icon-color="#66cc66" icon-background="#e6ffe6" title="打分用户" data="13"></OverviewCard>
      <OverviewCard icon="Collection" icon-color="#ffaa00" icon-background="#ffeecc" title="普通用户" data="1">
      </OverviewCard>
    </div>
    <div class="data-list">
      <el-table :data="tableData" style="width: 100%;" stripe>
        <DataTableColums :col-rules=columnsRules></DataTableColums>
        <el-table-column>
          <template #header>
            <div style="width: 50%; display: flex; gap: 10px;">
              <el-input v-model="search" size="small" placeholder="Type to search" />
              <el-button>查找</el-button>
              <el-button>添加</el-button>
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
      </el-table>
      <PaginationBar></PaginationBar>
    </div>
  </div>
</template>

<script setup>
import PaginationBar from '@/components/common/PaginationBar.vue'
import OverviewCard from '@/components/common/overviewCard.vue'
import DataTableColums from '@/components/common/DataTableColums.vue'

const handleEdit = (index, row) => {
  console.log(index, row)
}
const handleDelete = (index, row) => {
  console.log(index, row)
}

const tableData = [
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
    username: "admin",
    name: "超级管理员",
    role: "normal",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1998,
    username: "admin",
    name: "超级管理员",
    role: "normal",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 17875,
    username: "admin",
    name: "超级管理员",
    role: "scorer",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  }
]
const columnsRules = [
  {
    label: '用户ID',
    width: '170',
    colDataName: 'id',
    icon: 'none',
  },
  {
    label: '用户名',
    width: '170',
    colDataName: 'username',
  },
  {
    label: '昵称',
    width: '170',
    colDataName: 'name',
  },
  {
    label: '创建时间',
    width: '200',
    colDataName: 'createTime',
    icon: 'timer'
  },
  {
    label: '角色',
    width: '150',
    colDataName: 'role',
    tagTypeMap: {
      super_admin: 'primary',
      admin: 'primary',
      scorer: 'success',
      normal: 'info'
    },
    tagNameMap: {
      super_admin: '超级管理员',
      admin: '管理员',
      scorer: '打分用户',
      normal: '普通用户'
    },
  },
  {
    label: '账户状态',
    width: '150',
    colDataName: 'isEnabled',
    tagTypeMap: {
      true: 'success',
      false: 'danger'
    },
    tagNameMap: {
      true: '可用',
      false: '禁用'
    },
  }

]

</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px
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
</style>
