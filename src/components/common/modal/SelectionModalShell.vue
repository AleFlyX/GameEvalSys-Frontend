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

.selection-summary {
  display: block;
}

.toolbar-and-preview {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.toolbar {
  flex: 1 1 60%;
}

.preview {
  flex: 0 0 35%;
}

.table-area {
  width: 100%;
}

.pagination-area {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .toolbar-and-preview {
    flex-direction: column;
  }

  .preview {
    order: 2
  }
}
</style>
