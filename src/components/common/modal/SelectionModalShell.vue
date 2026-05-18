<template>
  <Teleport to="body">
    <BaseFormModal :visible="visible" :width="width" :min-height="minHeight" :allow-mask-close="allowMaskClose"
      @update:visible="(v) => $emit('update:visible', v)">
      <template #title>
        <slot name="title"></slot>
      </template>

      <template #form>
        <div class="selection-modal-shell">
          <section class="selection-summary" v-if="$slots.summary">
            <slot name="summary"></slot>
          </section>

          <div class="toolbar-and-preview">
            <div class="toolbar" v-if="$slots.toolbar">
              <slot name="toolbar"></slot>
            </div>
            <div class="preview" v-if="$slots.preview">
              <slot name="preview"></slot>
            </div>
          </div>

          <div class="table-area">
            <slot name="table"></slot>
          </div>

          <div class="pagination-area" v-if="$slots.pagination">
            <slot name="pagination"></slot>
          </div>
        </div>
      </template>

      <template #operations>
        <slot name="operations"></slot>
      </template>
    </BaseFormModal>
  </Teleport>
</template>

<script setup>
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
defineProps({
  visible: { type: Boolean, default: false },
  width: { type: String, default: '78%' },
  minHeight: { type: String, default: '72%' },
  allowMaskClose: { type: Boolean, default: false }
});
defineEmits(['update:visible']);
</script>

<style scoped>
.selection-modal-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Summary / stats strip (accepts either .selection-summary or .selection-summary-panel) */
.selection-summary,
.selection-summary-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.selection-summary .summary-item,
.selection-summary-panel .summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: var(--bg-secondary, var(--el-fill-color-light));
  border: 1px solid var(--border, var(--el-border-color-lighter));
  border-radius: 12px;
}

.selection-summary .summary-item span,
.selection-summary-panel .summary-item span {
  color: var(--text-secondary, var(--el-text-color-secondary));
  font-size: 13px;
}

.selection-summary .summary-item strong,
.selection-summary-panel .summary-item strong {
  color: var(--text-primary, var(--el-text-color-primary));
  font-size: 22px;
  line-height: 1.2;
}

/* Toolbar + preview layout */
.toolbar-and-preview {
  display: flex;
  flex-direction: column;
  /* display: grid; */
  /* grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr); */
  gap: 12px;
  /* align-items: start; */
}

.toolbar {
  flex: 1;
  display: block;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
  gap: 12px;
}

.toolbar-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, var(--el-border-color-lighter));
  border-radius: 12px;
}

.toolbar-card--actions {
  min-width: 0;
}

.toolbar-label {
  color: var(--text-secondary, var(--el-text-color-secondary));
  font-size: 13px;
  font-weight: 600;
}

.search-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 250px;
}

.role-select {
  width: 180px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.selection-summary {
  margin-right: auto;
  color: var(--text-secondary, var(--el-text-color-secondary));
  font-weight: 600;
  white-space: nowrap;
}

/* Preview area */
.preview,
.selected-preview {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: var(--bg-secondary, var(--el-fill-color-light));
  border: 1px solid var(--border, var(--el-border-color-lighter));
  border-radius: 12px;
}

.preview-label {
  color: var(--text-primary, var(--el-text-color-regular));
  line-height: 32px;
  white-space: nowrap;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-area {
  width: 100%;
}

.table-area :deep(.table-container) {
  border-radius: 12px;
  overflow: hidden;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
  padding: 2px 2px 0;
}

@media (max-width: 960px) {

  .search-input,
  .role-select {
    width: 100%;
  }
}
</style>
