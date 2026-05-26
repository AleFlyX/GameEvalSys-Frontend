<template>
  <BaseFormModal :visible="props.visible" width="760px" min-height="65%"
    @update:visible="emit('update:visible', $event)">
    <template #title>
      <span>{{ props.title }}</span>
    </template>

    <template #form>
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="100px" status-icon>
        <el-form-item label="上级菜单" prop="parentId">
          <el-select v-model="formModel.parentId" placeholder="无上级菜单" clearable filterable style="width: 100%">
            <el-option v-for="option in props.parentOptions" :key="option.id" :label="option.label" :value="option.id"
              :disabled="option.disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="formModel.title" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单编码" prop="menuCode">
          <el-input v-model="formModel.menuCode" placeholder="请输入菜单编码" :disabled="props.isEditing" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="menuType">
          <el-select v-model="formModel.menuType" placeholder="请选择菜单类型" filterable allow-create style="width: 100%">
            <el-option label="目录" value="catalog" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
          </el-select>
        </el-form-item>

        <el-form-item label="路径" prop="path">
          <el-input v-model="formModel.path" placeholder="请输入路由路径，例如 /admin/menu" />
        </el-form-item>

        <el-form-item label="路由名" prop="routeName">
          <el-input v-model="formModel.routeName" placeholder="请输入路由名称" />
        </el-form-item>

        <el-form-item label="组件编码" prop="componentCode">
          <el-input v-model="formModel.componentCode" placeholder="请输入 componentCode，目录类型可留空" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-popover v-model:visible="iconPickerVisible" :width="420" placement="bottom-start" trigger="click"
            :teleported="false">
            <template #reference>
              <button type="button" class="icon-picker-trigger">
                <div class="icon-preview" :class="{ 'is-empty': !formModel.icon }">
                  <el-icon v-if="formModel.icon">
                    <component :is="getElementIcon(formModel.icon)" />
                  </el-icon>
                  <span v-else>预览</span>
                </div>
                <div class="icon-picker-copy">
                  <span class="icon-picker-label">{{ selectedIconLabel }}</span>
                  <span class="icon-picker-hint">点击从图标库中选择</span>
                </div>
                <el-icon class="icon-picker-arrow">
                  <component :is="getElementIcon('ArrowDown')"></component>
                </el-icon>
              </button>
            </template>

            <div class="icon-picker-panel">
              <el-input v-model="iconSearchText" clearable placeholder="搜索图标名称，例如 Grid、Setting、Management" />

              <div class="icon-picker-meta">
                <span>共 {{ filteredIconOptions.length }} 个可选图标</span>
                <el-button text type="primary" :disabled="!formModel.icon" @click="handleClearIcon">
                  清空
                </el-button>
              </div>

              <div v-if="filteredIconOptions.length" class="icon-grid">
                <button v-for="option in filteredIconOptions" :key="option.name" type="button" class="icon-grid-item"
                  :class="{ 'is-active': option.name === formModel.icon }" @click="handlePickIcon(option.name)">
                  <span class="icon-grid-icon">
                    <el-icon>
                      <component :is="option.icon" />
                    </el-icon>
                  </span>
                  <span class="icon-grid-name">{{ option.name }}</span>
                </button>
              </div>

              <div v-else class="icon-grid-empty">
                没有匹配的图标
              </div>
            </div>
          </el-popover>
        </el-form-item>

        <el-form-item label="排序" prop="sortNum">
          <el-input-number v-model="formModel.sortNum" :min="0" :step="1" controls-position="right"
            style="width: 100%" />
        </el-form-item>

        <el-form-item label="可见状态" prop="hidden">
          <el-switch v-model="formModel.hidden" active-text="隐藏" inactive-text="显示" />
        </el-form-item>

        <el-form-item label="启用状态" prop="isEnabled">
          <el-switch v-model="formModel.isEnabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>

        <el-form-item label="角色范围" prop="roleCodes">
          <el-checkbox-group v-model="formModel.roleCodes">
            <el-checkbox v-for="role in props.roleOptions" :key="role.value" :label="role.value">
              {{ role.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </template>

    <template #operations>
      <div class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取消</el-button>
        <el-button type="primary" :loading="props.loading" @click="handleSubmit">
          保存
        </el-button>
      </div>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { computed, ref, toRef } from 'vue';

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import { elementIconMap, getElementIcon } from '@/utils/elementIcons';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '菜单',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  formModel: {
    type: Object,
    default: () => ({}),
  },
  parentOptions: {
    type: Array,
    default: () => [],
  },
  roleOptions: {
    type: Array,
    default: () => [],
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);
const formModel = toRef(props, 'formModel');
const iconPickerVisible = ref(false);
const iconSearchText = ref('');

const iconOptions = computed(() => Object.entries(elementIconMap)
  .map(([name, icon]) => ({ name, icon }))
  .sort((left, right) => left.name.localeCompare(right.name, 'en')));

const filteredIconOptions = computed(() => {
  const keyword = iconSearchText.value.trim().toLowerCase();

  if (!keyword) {
    return iconOptions.value;
  }

  return iconOptions.value.filter(({ name }) => name.toLowerCase().includes(keyword));
});

const selectedIconLabel = computed(() => formModel.value.icon || '请选择图标');

const handlePickIcon = (iconName) => {
  formModel.value.icon = iconName;
  iconPickerVisible.value = false;
};

const handleClearIcon = () => {
  formModel.value.icon = '';
  iconSearchText.value = '';
};

const validateComponentCode = (_rule, value, callback) => {
  if (formModel.value.menuType === 'catalog') {
    callback();
    return;
  }

  if (!String(value || '').trim()) {
    callback(new Error('非目录菜单请填写组件编码'));
    return;
  }

  callback();
};

const formRules = computed(() => ({
  parentId: [],
  menuCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
  routeName: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
  componentCode: [{ validator: validateComponentCode, trigger: 'blur' }],
}));

const handleSubmit = async () => {
  try {
    await formRef.value?.validate?.();
  } catch {
    return;
  }

  emit('submit', {
    ...formModel.value,
    roleCodes: Array.isArray(formModel.value.roleCodes) ? [...formModel.value.roleCodes] : [],
  });
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.icon-picker-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.icon-picker-trigger:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.icon-picker-trigger:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

.icon-picker-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.icon-picker-label {
  color: var(--text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-picker-hint {
  color: var(--text-secondary);
  font-size: 12px;
}

.icon-picker-arrow {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.icon-preview {
  width: 48px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
  flex-shrink: 0;
}

.icon-preview.is-empty {
  color: var(--text-secondary);
}

.icon-picker-panel {
  display: grid;
  gap: 12px;
}

.icon-picker-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  max-height: 280px;
  overflow: auto;
  padding-right: 2px;
}

.icon-grid-item {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 10px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  color: var(--text);
}

.icon-grid-item:hover,
.icon-grid-item.is-active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
}

.icon-grid-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.icon-grid-name {
  width: 100%;
  font-size: 12px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-grid-empty {
  padding: 24px 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 12px;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .icon-preview {
    width: 44px;
    height: 36px;
  }

  .icon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
