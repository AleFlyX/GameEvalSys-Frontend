<template>
  <div class="admin-panel">
    <!-- 避免各个管理面板组件的css部分冗余 -->
    <header>
      <slot name="header">
        <!-- 数据预览小卡片区域 -->
      </slot>
    </header>

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
  justify-content: center;
  align-items: center;
  gap: 15px;
}

header {
  margin: 15px 10px;
  display: flex;
  width: 99%;
  gap: 10px;
}

/* 保证在header里显示的数据卡片的宽度都一样 */
header>* {
  flex: 1;
}

main {
  width: 99%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0px 2px 8px gray;
  border-radius: 15px;

}

footer {
  width: 99%;
  display: flex;
  justify-content: center;
}
</style>
