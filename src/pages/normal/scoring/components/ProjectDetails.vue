<template>
  <!-- 项目详情 -->
  <BaseModal v-model:visible="showProjectDetailDialog" :title="selectedProject?.name">
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
        <!-- <el-tag :type="getStatusTagType(selectedProject?.status)">
          {{ formatStatus(selectedProject?.status) }}
        </el-tag> -->
      </div>
    </div>
  </BaseModal>
</template>
<script setup>
import { ref, watch } from 'vue';
import BaseModal from '@/components/common/modal/BaseModal.vue';
const props = defineProps({
  selectedProject: {
    type: Object,
    default: () => ({})
  }
})

watch(() => props.selectedProject,
  (newVal) => {
    console.log(newVal)
  }
)

</script>
