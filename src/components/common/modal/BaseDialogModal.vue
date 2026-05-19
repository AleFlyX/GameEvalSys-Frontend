<template>
  <BaseModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #layout>
      <div class="dialog-layout">
        <header class="dialog-header">
          <h3 class="dialog-title">
            <slot name="header">
              <!-- 标题 -->
            </slot>
          </h3>
        </header>

        <div class="dialog-body">
          <slot name="body">
          </slot>
        </div>

        <div class="operation">
          <slot name="footer">
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
.dialog-layout {
  min-height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 24px 24px 20px;
}

.dialog-header {
  padding-right: 40px;
  padding-bottom: 14px;
}

.dialog-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--text-primary, #1f2a44);
}

.dialog-body {
  min-height: 0;
  padding: 4px 2px 0;
  overflow-y: auto;
}

:deep(.dark-modal) .dialog-title {
  color: #f7f9fc;
}

@media (max-width: 768px) {
  .dialog-layout {
    padding: 20px 18px 16px;
  }

  .dialog-title {
    font-size: 20px;
  }
}
</style>
