<template>
  <el-table :data="list" v-loading="loading" stripe>
    <el-table-column type="index" label="#" width="64" />
    <el-table-column label="提交人" min-width="120">
      <template #default="{ row }">{{ row.userName || row.submitterName || row.userId || '-' }}</template>
    </el-table-column>
    <el-table-column prop="projectName" label="项目名" min-width="180" show-overflow-tooltip />
    <el-table-column label="提交时间" min-width="160">
      <template #default="{ row }">{{ formatDisplayDate(row.updatedAt || row.createdAt) }}</template>
    </el-table-column>
    <el-table-column label="状态" width="110">
      <template #default="{ row }">
        <el-tag :type="statusTagType(row.status)" effect="light">{{ statusLabel(row.status) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="分数" width="110">
      <template #default="{ row }">{{ scoreLabel(row) }}</template>
    </el-table-column>
    <el-table-column label="操作" width="170" fixed="right">
      <template #default="{ row }">
        <el-button size="small" @click="$emit('view', row)">查看</el-button>
        <el-button v-if="row.status !== 'scored'" size="small" type="primary"
          @click="$emit('grade', row)">评分</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  list: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

defineEmits(['view', 'grade']);

const statusLabelMap = {
  pending: '待评分',
  scoring: '评分中',
  scored: '已评分',
  returned: '已打回'
};

const statusTypeMap = {
  pending: 'warning',
  scoring: 'primary',
  scored: 'success',
  returned: 'danger'
};

const statusLabel = (status) => statusLabelMap[status] || '未知';
const statusTagType = (status) => statusTypeMap[status] || 'info';

const formatDisplayDate = (value) => {
  if (!value) return '-';
  const date = new Date(String(value).replace(/-/g, '/'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const scoreLabel = (row) => {
  if (row.finalScore === null || row.finalScore === undefined) return '-';
  return row.totalScore ? `${row.finalScore} / ${row.totalScore}` : row.finalScore;
};
</script>
