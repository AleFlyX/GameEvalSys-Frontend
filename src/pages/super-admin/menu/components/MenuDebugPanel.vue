<template>
  <div v-dev class="menu-debug-panel">
    <el-alert title="菜单调试输出" type="info" :closable="false" show-icon>
      <div class="menu-debug-content">
        <div class="menu-debug-row">
          <span>根节点数</span>
          <strong>{{ menuDebugInfo.rootCount }}</strong>
        </div>
        <div class="menu-debug-row">
          <span>可见节点数</span>
          <strong>{{ menuDebugInfo.visibleCount }}</strong>
        </div>
        <div class="menu-debug-row">
          <span>展开 key 数</span>
          <strong>{{ menuDebugInfo.expandedCount }}</strong>
        </div>
        <div class="menu-debug-row">
          <span>渲染行数</span>
          <strong>{{ menuDebugInfo.renderedCount }}</strong>
        </div>
        <div class="menu-debug-row menu-debug-row--full">
          <span>根节点摘要</span>
          <pre>{{ menuDebugInfo.rootSummaryText }}</pre>
        </div>
      </div>
    </el-alert>
  </div>
</template>

<script setup>
defineProps({
  menuDebugInfo: {
    type: Object,
    default: () => ({
      rootCount: 0,
      visibleCount: 0,
      expandedCount: 0,
      renderedCount: 0,
      rootSummaryText: '-',
    }),
  },
});
</script>

<style scoped>
.menu-debug-panel {
  margin: 12px 0 4px;
}

.menu-debug-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
  align-items: start;
}

.menu-debug-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.04);
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.menu-debug-row strong {
  color: var(--text);
}

.menu-debug-row--full {
  grid-column: 1 / -1;
  align-items: flex-start;
}

.menu-debug-row--full pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .menu-debug-content {
    grid-template-columns: 1fr;
  }
}
</style>
