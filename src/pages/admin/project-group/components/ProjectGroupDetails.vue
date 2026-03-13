<template>
  <BaseModal v-model:visible="showDetailDialog" :allow-mask-close="false">
    <template #layout>
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
import BaseModal from '@/components/common/modal/BaseModal.vue';
const props = defineProps({
  selectedGroup: {
    type: Object,
    default: () => { }
  }
})
</script>
