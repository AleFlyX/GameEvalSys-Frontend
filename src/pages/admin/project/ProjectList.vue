<template>
  <AdminPanel>
    <template #dataCards>
      <OverviewCard></OverviewCard>
      <OverviewCard></OverviewCard>
    </template>

    <SearchInput size="middle" @search="handleSearch" @add="handleAdd"></SearchInput>

    <template #dataTable>
      <el-table>
        <DataTableColums></DataTableColums>
      </el-table>
    </template>

    <template #footer>
      <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
        :page-sizes="[10, 20, 30]" size="middle" :disabled="pagenationDisabled" :total="totalData"
        @size-change="handleSizeChange" layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <ProjectConfirmDelete v-model:visible="showDeleteProjectDialog" :data="waitToDelete"></ProjectConfirmDelete>
      <button @click="showDeleteProjectDialog = !showDeleteProjectDialog">testDelete</button>
    </template>
  </AdminPanel>
</template>

<script setup>
import AdminPanel from '@/layouts/AdminPanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import ProjectConfirmDelete from './components/ProjectConfirmDelete.vue';

import { reactive, ref } from 'vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';

const totalData = ref(100)
const pageParams = reactive({
  page: 1,
  size: 10,
})
const showDeleteProjectDialog = ref(false)
</script>

<style scoped></style>
