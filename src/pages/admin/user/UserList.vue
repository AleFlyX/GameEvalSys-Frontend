<template>
  <div style="display: flex; ">
    <OverviewCard icon="Coin" icon-background="#ccf5ff" title="title1" data="235" icon-color="#33d6ff">
    </OverviewCard>
    <OverviewCard>

    </OverviewCard>
  </div>

  <el-table :data="tableData" style="width: 100%" stripe>
    <el-table-column label="用户ID" width="200">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{{ scope.row.id }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="用户名" width="200">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon>
            <user />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.username }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="角色" width="180">
      <template #default="scope">
        <el-tag>{{ scope.row.name }}</el-tag>
        <!-- <el-popover effect="light" trigger="hover" placement="top" width="auto">
          <template #default>
            <div>name: {{ scope.row.role }}</div>
            <div>address: {{ scope.row.address }}</div>
          </template>
  <template #reference>
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
  </el-popover> -->
      </template>
    </el-table-column>
    <el-table-column label="账户状态" width="180">
      <template #default="scope">
        <el-tag type="">
          {{ scope.row.isEnabled == true ? '可用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="180">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon>
            <timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column>
      <template #header>
        <div style="width: 50%; display: flex; gap: 10px;">
          <el-input v-model="search" size="small" placeholder="Type to search" />
          <el-button>查找</el-button>
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
</template>

<script setup>
import PaginationBar from '@/components/common/PaginationBar.vue'
import OverviewCard from '../../../components/common/OverviewCard.vue'


const handleEdit = (index, row) => {
  console.log(index, row)
}
const handleDelete = (index, row) => {
  console.log(index, row)
}

const tableData = [
  {
    id: 1,
    username: "admin",
    role: "super_admin",
    name: "超级管理员",
    isEnabled: true
  },
  {
    id: 1,
    username: "admin",
    role: "super_admin",
    name: "超级管理员"
  },
  {
    id: 1,
    username: "admin",
    name: "超级管理员",
    role: "super_admin",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1,
    username: "admin",
    name: "超级管理员",
    role: "super_admin",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1,
    username: "admin",
    name: "超级管理员",
    role: "super_admin",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
  {
    id: 1,
    username: "admin",
    name: "超级管理员",
    role: "super_admin",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  }
]
</script>
