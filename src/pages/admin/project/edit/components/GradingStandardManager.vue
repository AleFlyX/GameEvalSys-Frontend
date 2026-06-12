<template>
  <div class="grading-standard-placeholder">
    <el-alert
      title="评分标准管理"
      type="warning"
      description="本阶段先预留作业评分标准入口。完整的维度可视化编辑器与文件上传会在下一阶段接入。"
      :closable="false"
      show-icon
    />

    <div class="placeholder-panel">
      <el-empty description="评分标准编辑器即将接入">
        <template #description>
          <p>当前项目的作业评分标准仍建议在现有打分标准模块维护。</p>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'GradingStandardManager'
});
</script>

<style scoped>
.grading-standard-placeholder {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.placeholder-panel {
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--bg-secondary);
  padding: 24px;
}

html[data-theme="dark"] .placeholder-panel {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}
</style>
