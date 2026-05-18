<template>
  <BaseDialogModal v-bind="$attrs" @update:visible="emits('update:visible', $event)">
    <template #header>
      <div class="dialog-title-wrap">
        <h3>{{ selectedGroup?.name }} - 详情</h3>
        <p>查看项目小组基础信息与启用状态</p>
      </div>
    </template>
    <template #body>
      <div class="detail-section">
        <section class="detail-summary">
          <span class="summary-label">当前状态</span>
          <el-tag :type="selectedGroup?.isEnabled ? 'success' : 'danger'">
            {{ selectedGroup?.isEnabled ? '启用' : '禁用' }}
          </el-tag>
        </section>

        <div class="detail-item detail-item--block">
          <label>小组ID:</label>
          <span>{{ selectedGroup?.id }}</span>
        </div>
        <div class="detail-item detail-item--block">
          <label>小组名称:</label>
          <span>{{ selectedGroup?.name }}</span>
        </div>
        <div class="detail-item detail-item--block">
          <label>描述:</label>
          <span>{{ selectedGroup?.description || '无' }}</span>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <label>创建时间:</label>
            <span>{{ selectedGroup?.createTime || '未设置' }}</span>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="cancel-btn" @click="handleClose()">关闭</button>
    </template>

  </BaseDialogModal>
</template>

<script setup>
import BaseDialogModal from '@/components/common/modal/BaseDialogModal.vue';
defineProps({
  selectedGroup: {
    type: Object,
    default: () => { }
  }
})

const emits = defineEmits(['update:visible']);
const handleClose = () => {
  emits('update:visible', false)
}
</script>
<style scoped>
.dialog-title-wrap h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  color: #1f2a44;
}

.dialog-title-wrap p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #7b8798;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0 0;
}

.detail-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(47, 107, 255, 0.08), rgba(32, 183, 199, 0.08));
  border: 1px solid rgba(47, 107, 255, 0.12);
}

.summary-label {
  font-size: 13px;
  font-weight: 600;
  color: #55637a;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5ebf3;
}

.detail-item--block {
  width: 100%;
}

.detail-item label {
  flex: 0 0 auto;
  font-weight: 600;
  min-width: 100px;
  color: #1f2a44;
}

.detail-item span {
  flex: 1;
  color: #606266;
  word-break: break-all;
}

@media (max-width: 768px) {
  .dialog-title-wrap h3 {
    font-size: 20px;
  }

  .detail-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
