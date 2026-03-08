<template>
  <PagePanel>
    <template #header>
      <OverviewCard></OverviewCard>
      <OverviewCard></OverviewCard>
    </template>
    <template #main-table>
      <el-table>
        <DataTableColums>

        </DataTableColums>
      </el-table>
    </template>
    <template #footer>

    </template>
    <template #modals>

    </template>
  </PagePanel>
</template>
<script setup>
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import PagePanel from '@/layouts/PagePanel.vue';

</script>
