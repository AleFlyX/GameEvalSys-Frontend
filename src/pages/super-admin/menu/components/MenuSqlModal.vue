<template>
  <BaseFormModal :visible="props.visible" width="960px" min-height="70%"
    @update:visible="emit('update:visible', $event)">
    <template #title>
      <span>{{ props.title }}</span>
    </template>

    <template #form>
      <div v-loading="props.loading" class="menu-sql-modal-body">
        <el-alert title="后端返回的标准 SQL" type="info" :closable="false" show-icon class="menu-sql-alert">
          <template #default>
            <div v-if="metaItems.length" class="menu-sql-meta">
              <span v-for="item in metaItems" :key="item.label">
                {{ item.label }}：{{ item.value || '-' }}
              </span>
            </div>
          </template>
        </el-alert>

        <el-input :model-value="props.sqlText" type="textarea" :rows="18" readonly resize="none"
          placeholder="后端返回的菜单 SQL 会显示在这里" class="menu-sql-textarea" />
      </div>
    </template>

    <template #operations>
      <div class="menu-sql-actions">
        <MyBtn @click="emit('update:visible', false)">关闭</MyBtn>
        <MyBtn type="primary" :disabled="props.loading || !props.sqlText" @click="emit('copy-sql')">
          复制 SQL
        </MyBtn>
      </div>
    </template>
  </BaseFormModal>
</template>

<script setup>
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '菜单 SQL',
  },
  sqlText: {
    type: String,
    default: '',
  },
  sqlMeta: {
    type: Object,
    default: () => ({
      menuCount: 0,
      generatedAt: '',
    }),
  },
  metaItems: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'copy-sql']);
</script>

<style scoped>
.menu-sql-modal-body {
  display: grid;
  gap: 14px;
  min-height: 100%;
}

.menu-sql-alert :deep(.el-alert__content) {
  width: 100%;
}

.menu-sql-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.menu-sql-textarea :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  line-height: 1.65;
}

.menu-sql-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
