<template>
  <el-drawer v-model="visible" title="提交详情" size="520px">
    <el-descriptions v-if="record" :column="1" border>
      <el-descriptions-item label="项目">{{ record.projectName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="提交人">{{ record.userName || record.submitterName || record.userId || '-'
        }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(record.status)">{{ statusLabel(record.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="项目文件">{{ record.fileOriginalName || record.filePath || '-' }}</el-descriptions-item>
      <el-descriptions-item label="答辩文件">{{ record.pptOriginalName || record.pptPath || '-' }}</el-descriptions-item>
      <el-descriptions-item label="最终分">{{ scoreLabel }}</el-descriptions-item>
      <el-descriptions-item label="教师评语">{{ record.reviewComment || '-' }}</el-descriptions-item>
      <el-descriptions-item label="项目描述">{{ record.description || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-empty v-else description="请选择提交记录" />
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue';

const visible = defineModel('visible', { type: Boolean, default: false });

const props = defineProps({
  record: { type: Object, default: null }
});

const statusLabelMap = { pending: '待评分', scoring: '评分中', scored: '已评分', returned: '已打回' };
const statusTypeMap = { pending: 'warning', scoring: 'primary', scored: 'success', returned: 'danger' };

const statusLabel = (status) => statusLabelMap[status] || '未知';
const statusTagType = (status) => statusTypeMap[status] || 'info';

const scoreLabel = computed(() => {
  if (!props.record || props.record.finalScore === null || props.record.finalScore === undefined) return '-';
  return props.record.totalScore ? `${props.record.finalScore} / ${props.record.totalScore}` : props.record.finalScore;
});
</script>
