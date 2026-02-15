<template>
  <div class="admin-panel">
    <div style="display: flex; width: 100%; ">
      <slot name="dataCards">
        <!-- 数据预览小卡片区域 -->
      </slot>
    </div>

    <slot>
      <!-- 其他小组件区域 -->
    </slot>

    <div class="data-list">
      <slot name="dataTable">
        <!-- el table组件 -->
      </slot>
      <slot name="footer">
        <!-- 分页跳转组件等 -->
      </slot>

    </div>

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
  gap: 15px
}

.data-list {
  width: 99%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0px 2px 8px gray;
  border-radius: 15px;

}

.pagination {
  width: 99%;
  display: flex;

  justify-content: center;
}
</style>
