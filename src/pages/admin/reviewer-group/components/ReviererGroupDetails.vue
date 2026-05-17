<template>
  <BaseDialogModal v-bind="$attrs" :allow-mask-close="false">
    <template #header>
      <h3>{{ selectedGroup?.name }} - 详情</h3>
    </template>
    <template #body>
      <div class="detail-section">
        <div class="detail-item">
          <label>评审组ID:</label>
          <span>{{ selectedGroup?.id }}</span>
        </div>
        <div class="detail-item">
          <label>评审组名称:</label>
          <span>{{ selectedGroup?.name }}</span>
        </div>
        <div class="detail-item">
          <label>描述:</label>
          <span>{{ selectedGroup?.description || '无' }}</span>
        </div>
        <div class="detail-item">
          <label>成员数:</label>
          <span>{{ selectedGroup?.memberIds?.length || 0 }}</span>
        </div>
        <div class="detail-item">
          <label>创建时间:</label>
          <span>{{ selectedGroup?.createTime }}</span>
        </div>
        <div class="detail-item">
          <label>状态:</label>
          <div class="tag">
            <el-tag :type="selectedGroup?.isEnabled ? 'success' : 'danger'" :closable="false">
              {{ selectedGroup?.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </div>
        <div class="detail-item full-width">
          <label>成员列表:</label>
          <div class="members-list">
            <el-tag v-for="id in selectedGroup?.memberIds" :key="id" :closable="false">
              成员ID: {{ id }}
            </el-tag>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </BaseDialogModal>
</template>
<script setup>
import BaseDialogModal from '@/components/common/modal/BaseDialogModal.vue'

defineProps({
  selectedGroup: {
    type: Object,
    default: () => { }
  }
})

</script>
<style>
.detail-section {
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

.members-list,
.tag {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
