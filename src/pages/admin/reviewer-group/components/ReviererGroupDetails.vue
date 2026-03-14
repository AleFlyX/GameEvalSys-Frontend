<template>
  <BaseModal v-bind="$attrs" :allow-mask-close="false">
    <template #layout>
      <!-- <button @click="console.log($attrs)">attrs</button> -->
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ selectedGroup?.name }} - 详情</h3>
        </div>
        <div class="modal-body">
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
              <el-tag :type="selectedGroup?.isEnabled ? 'success' : 'danger'">
                {{ selectedGroup?.isEnabled ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <div class="detail-item full-width">
              <label>成员列表:</label>
              <div class="members-list">
                <el-tag v-for="id in selectedGroup?.memberIds" :key="id" closable="false">
                  成员ID: {{ id }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
<script setup>
import BaseModal from '@/components/common/modal/BaseModal.vue'

const props = defineProps({
  selectedGroup: {
    type: Object,
    default: () => { }
  }
})

</script>
<style>
.modal-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 500px;
}

.modal-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.modal-body {
  max-height: 400px;
  overflow-y: auto;
  flex: 1;
}

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

.members-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
