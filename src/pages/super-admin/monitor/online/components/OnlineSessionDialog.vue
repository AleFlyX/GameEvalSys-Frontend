<template>
  <base-dialog-modal v-model:visible="visible" title="用户会话详情" width="900px">
    <template #header>
      <div class="session-dialog-header">
        <span>用户：{{ user?.username || '-' }}</span>
        <span>姓名：{{ user?.name || '-' }}</span>
      </div>
    </template>
    <template #body>
      <el-table v-loading="loading" :data="sessions" border style="width: 100%;" empty-text="暂无会话">
        <el-table-column label="SID" prop="sid" min-width="230" :show-overflow-tooltip="true" />
        <el-table-column label="状态" prop="status" width="110" align="center" />
        <el-table-column label="登录时间" prop="loginAt" width="180" align="center" />
        <el-table-column label="最近活跃" prop="lastActiveAt" width="180" align="center" />
        <el-table-column label="操作" width="110" align="center">
          <template #default="scope">
            <el-button link type="danger" size="small" :disabled="scope.row.status !== 'active'"
              @click="emitKick(scope.row)">
              强退
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </base-dialog-modal>
</template>

<script setup>
import BaseDialogModal from '@/components/common/modal/BaseDialogModal.vue';

defineOptions({
  name: 'OnlineSessionDialog',
});

const emit = defineEmits(['kick-session']);
const visible = defineModel('visible', { type: Boolean, required: true });

defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  sessions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function emitKick(row) {
  emit('kick-session', row);
}
</script>

<style scoped>
.session-dialog-header {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  color: #606266;
}
</style>
