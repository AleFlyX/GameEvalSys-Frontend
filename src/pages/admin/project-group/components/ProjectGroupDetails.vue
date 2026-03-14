<template>
  <BaseDialogModal v-bind="$attrs" @update:visible="emits('update:visible', $event)">
    <template #header>
      {{ selectedGroup?.name }} - 详情
    </template>
    <template #body>
      <div class="detail-section">
        <div class="detail-item">
          <label>小组ID:</label>
          <span>{{ selectedGroup?.id }}</span>
        </div>
        <div class="detail-item">
          <label>小组名称:</label>
          <span>{{ selectedGroup?.name }}</span>
        </div>
        <div class="detail-item">
          <label>描述:</label>
          <span>{{ selectedGroup?.description || '无' }}</span>
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
      </div>
    </template>
    <template #footer>
      <button @click="handleClose()">关闭</button>
      <!-- <button @click="console.log(selectedGroup)">dataIN</button> -->
    </template>

  </BaseDialogModal>
</template>

<script setup>
import BaseDialogModal from '@/components/common/modal/BaseDialogModal.vue';
const props = defineProps({
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
</style>
