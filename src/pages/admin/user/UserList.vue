<template>

  <el-table :data="tableData" style="width: 100%">
    <el-table-column label="用户ID" width="180">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <span style="margin-left: 10px">{{ scope.row.date }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="用户名" width="180">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon>
            <user />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.date }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="角色" width="180">
      <template #default="scope">
        <el-popover effect="light" trigger="hover" placement="top" width="auto">
          <template #default>
            <div>name: {{ scope.row.name }}</div>
            <div>address: {{ scope.row.address }}</div>
          </template>
          <template #reference>
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="创建时间" width="180">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon>
            <timer />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.date }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column>
      <template #header>
        <div style="width: 50%; display: flex; gap: 10px;">
          <el-input v-model="search" size="small" placeholder="Type to search" />
          <el-button>find</el-button>
        </div>
      </template>
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
          Edit
        </el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
          Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <PaginationBar></PaginationBar>
</template>

<script setup>
import PaginationBar from '@/components/common/PaginationBar.vue'


const handleEdit = (index, row) => {
  console.log(index, row)
}
const handleDelete = (index, row) => {
  console.log(index, row)
}

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
</script>
