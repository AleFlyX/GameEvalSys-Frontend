<template>
  <BaseFormModal v-bind="$attrs" @update:visible="emits('update:visible', $event)">
    <template #title>
      {{ editMode ? '编辑项目小组' : '新建项目小组' }}
    </template>
    <template #form>
      <ProjectGroupForm ref="projectGroupFormRef" :data="editingData" :edit-mode="editMode">
      </ProjectGroupForm>
    </template>
    <template #operations>
      <button class="primary-btn" @click="val">
        data
      </button>
      <button class="primary-btn" @click="handleSubmit" :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '确认' }}
      </button>
      <button class="cancel-btn" @click="handleCancel" :disabled="isSubmitting">
        取消
      </button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import ProjectGroupForm from './ProjectGroupForm.vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import { projectGroupApi } from '@/api/project-group';
import { ElMessage } from 'element-plus';

const projectGroupFormRef = ref(null);
const isSubmitting = ref(false);

const props = defineProps({
  editMode: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      isEnabled: true
    })
  }
});

const emits = defineEmits(['update:visible', 'refresh']);

// 初始化表单数据
const editingData = ref({ name: '', description: '', isEnabled: 1 });

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData) {
    editingData.value = { ...newData };
  } else {
    editingData.value = { name: '', description: '', isEnabled: 1 };
  }
}, { immediate: true, deep: true });


const val = async () => {
  const { valid, data } = await projectGroupFormRef.value.validate();
  console.log(valid, data)
}
const handleSubmit = async () => {
  if (!projectGroupFormRef.value) {
    ElMessage.error('表单加载失败');
    return;
  }

  isSubmitting.value = true;

  try {
    const { valid, data } = await projectGroupFormRef.value.validate();

    if (!valid) {
      ElMessage.error('表单验证失败');
      return;
    }

    if (props.editMode && data.id) {
      // 编辑模式
      await projectGroupApi.editGroup(data.id, data);
      ElMessage.success('小组编辑成功');
    } else {
      // 新建模式
      await projectGroupApi.createGroups(data);
      console.log(data)
      ElMessage.success('小组创建成功');
    }

    emits('refresh');
    handleCancel();
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(`操作失败: ${error.message || error}`);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  emits('update:visible', false);
};

defineExpose({
  projectGroupFormRef
});
</script>
