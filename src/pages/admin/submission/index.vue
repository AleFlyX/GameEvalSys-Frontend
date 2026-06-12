<template>
  <div class="submission-placeholder">
    <el-empty description="管理员作业管理页将在下一阶段开放" />
  </div>
</template>

<script setup>
defineOptions({
  name: 'AdminSubmissionPlaceholder'
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
