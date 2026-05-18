<template>
  <div class="admin-panel">
    <header v-if="$slots.header" class="panel-header">
      <slot name="header">
        <!-- 数据预览小卡片区域 -->
      </slot>
    </header>

    <section class="panel-content">
      <div v-if="$slots.default" class="panel-toolbar">
        <slot>
          <!-- 其他小组件区域 -->
        </slot>
      </div>

      <main class="data-list">
        <slot name="main-table">
          <!-- el table组件 -->
        </slot>

        <footer v-if="$slots.footer" class="panel-footer">
          <slot name="footer">
            <!-- 分页跳转组件等 -->
          </slot>
        </footer>
      </main>
    </section>
  </div>

  <slot name="modals">
    <!-- 填写弹窗 -->
  </slot>
</template>

<script setup>
</script>

<style scoped>
.admin-panel {
  --panel-max-width: 92%;
  --panel-gap: 24px;
  min-height: 100vh;
  padding: 32px 0 28px;
  box-sizing: border-box;
  background: var(--bg-primary);
}

.panel-header,
.panel-content {
  width: var(--panel-max-width);
  margin: 0 auto;
}

.panel-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: var(--panel-gap);
}

.panel-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.data-list {
  width: 100%;
  min-height: 320px;
  padding: 28px 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  backdrop-filter: var(--card-backdrop);
}

.panel-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

@media (max-width: 768px) {
  .admin-panel {
    --panel-max-width: calc(100% - 24px);
    padding-top: 20px;
  }

  .panel-toolbar {
    gap: 12px;
  }

  .data-list {
    padding: 20px 18px;
    border-radius: 20px;
  }
}
</style>
