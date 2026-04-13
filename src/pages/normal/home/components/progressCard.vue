<template>
  <BaseCard shadow="hover">
    <template #header>
      <slot name="header"></slot>
    </template>
    <template #body>
      <div class="progress-main">
        <el-progress type="dashboard" :percentage="dashboardStats.completionRate" :stroke-width="10" color="#409eff" />
      </div>
      <p class="progress-desc">
        进行中项目 {{ dashboardStats.ongoingProjects }} 个，已结束 {{ dashboardStats.endedProjects }} 个。
      </p>
    </template>
  </BaseCard>
</template>
<script setup>
defineProps({
  dashboardStats: {
    type: Object,
    default: () => { }
  }
})
</script>
<style scoped>
.progress-main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 160px;
}

.progress-desc {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: #637287;
}
</style>
