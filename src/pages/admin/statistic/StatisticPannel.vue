<template>
  <div class="statistic-panel">
    statistic
    <el-table :data="tableData" style="width: 100%" stripe>
      <DataTableColums>

      </DataTableColums>
    </el-table>
  </div>
</template>

<script setup>
import DataTableColums from '@/components/common/DataTableColums.vue';

const tableData = [
  {
    id: 131231,
    username: "admin2323",
    role: "super_admin",
    name: "超级管理员",
    isEnabled: true,
    createTime: "2026-01-27 09:00:00"
  },
]
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
</style>
