<template>
  <div class="admin-panel">
    <header>
      <slot name="header">
        <!-- 数据预览小卡片区域 -->
      </slot>
    </header>

    <section class="panel-content">
      <slot>
        <!-- 其他小组件区域 -->
      </slot>

      <main class="data-list">
        <slot name="main-table">
          <!-- el table组件 -->
        </slot>
        <footer>
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
  background: #f6f8fa;
  padding: 32px 0 24px 0;
  box-sizing: border-box;
}

header {
  margin: 0 auto 18px auto;
  display: flex;
  width: 92%;
  gap: 16px;
  padding: 0 0 0 0;
  background: none;
}

header>* {
  flex: 1;
  min-width: 0;
}

.panel-content {
  width: 92%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-list {
  width: 100%;
  padding: 28px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fff;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.07), 0 1.5px 6px 0 rgba(0, 0, 0, 0.03);
  border-radius: 18px;
  border: 1px solid #ececec;
  min-height: 320px;
  box-sizing: border-box;
}

footer {
  width: 100%;
  display: flex;
  justify-content: center;
  background: none;
  box-shadow: none;
  padding: 0;
}
</style>
