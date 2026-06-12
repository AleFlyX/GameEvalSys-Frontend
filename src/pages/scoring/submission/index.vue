<template>
  <div class="submission-placeholder">
    <el-empty description="教师评分台将在下一阶段开放" />
  </div>
</template>

<script setup>
defineOptions({
  name: 'ScoringSubmissionPlaceholder'
});
</script>

<style scoped>
.submission-placeholder {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
</style>
