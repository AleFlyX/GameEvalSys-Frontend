<template>
  <!-- 项目详情 -->
  <BaseDialogModal v-bind="$attrs" :title="selectedProject?.name">
    <template #header>
      项目详细
    </template>
    <template #body>
      <div class="project-detail">
        <div class="detail-item">
          <label>项目名称:</label>
          <span>{{ selectedProject.name }}</span>
        </div>
        <div class="detail-item">
          <label>项目描述:</label>
          <span>{{ selectedProject?.description || '暂无描述' }}</span>
        </div>
        <div class="detail-item">
          <label>开始日期:</label>
          <span>{{ selectedProject?.startDate }}</span>
        </div>
        <div class="detail-item">
          <label>结束日期:</label>
          <span>{{ selectedProject?.endDate }}</span>
        </div>
        <div class="detail-item">
          <label>项目状态:</label>
          <el-tag :type="getStatusTagType(selectedProject?.status)">
            {{ formatStatus(selectedProject?.status) }}
          </el-tag>
        </div>
      </div>
    </template>
    <template #footer>
      <MyBtn @click="$emit('update:visible', false)">关闭</MyBtn>
    </template>
  </BaseDialogModal>
</template>
<script setup>
// import { ref, watch } from 'vue';
import BaseDialogModal from '@/components/common/modal/BaseDialogModal.vue';
const props = defineProps({
  selectedProject: {
    type: Object,
    default: () => ({})
  }
})
const statusMap = {
  not_started: 'info',
  ongoing: 'success',
  ended: 'danger'
}
const statusInfoMap = {
  not_started: '未开始',
  ongoing: '进行中',
  ended: '已结束'
}
const getStatusTagType = (status) => {
  return statusMap[status];
}
const formatStatus = (status) => {
  return statusInfoMap[status];
}
</script>
<style scoped>
.project-detail {
  padding: 20px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 20px;
}

.detail-item span {
  flex: 1;
  color: #606266;
  word-break: break-all;
}

.detail-item.full-width {
  flex-direction: column;
}

.detail-item.full-width label {
  margin-bottom: 10px;
  margin-right: 0;
}
</style>
