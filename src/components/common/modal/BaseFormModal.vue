<template>
  <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #layout>
      <div class="modal-layout">
        <div class="modal-title">
          <h3 class="title-text">
            <slot name="title">
              <!-- 标题 -->
            </slot>
          </h3>
        </div>

        <div class="modal-content">
          <slot name="form">
            <!-- 表单具体输入内容 -->
          </slot>
        </div>

        <div class="operation">
          <slot name="operations">
            <!-- 操作 -->
          </slot>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';

defineOptions({
  inheritAttrs: false
});

defineEmits(['update:visible']);
</script>

<style scoped>
.modal-layout {
  min-height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 24px 24px 20px;
}

.modal-title {
  padding-right: 40px;
  padding-bottom: 16px;
}

.title-text {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--text-primary, #1f2a44);
}

.modal-content {
  min-height: 0;
  flex: 1;
  padding: 4px 2px 0;
  overflow-y: auto;
  /* overflow-x: hidden; */
}

.operation {
  padding: 18px 0 0;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border, rgba(230, 236, 244, 0.88));
}

:deep(.dark-modal) .title-text {
  color: #f7f9fc;
}

:deep(.dark-modal) .operation {
  border-top-color: rgba(86, 98, 120, 0.4);
}

@media (max-width: 768px) {
  .modal-layout {
    padding: 20px 18px 16px;
  }

  .title-text {
    font-size: 20px;
  }

  .operation {
    flex-wrap: wrap;
  }
}
</style>
