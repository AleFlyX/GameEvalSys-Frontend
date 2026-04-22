<template>
  <BaseFormModal v-bind="$attrs" @update:visible="emits('update:visible', $event)" width="35%" min-height="58%">
    <template #title>
      {{ editMode ? '编辑项目小组' : '新建项目小组' }}
    </template>
    <template #form>
      <el-tabs v-model="tab">
        <el-tab-pane label="单独增加" name="basic">
          <ProjectGroupForm ref="projectGroupFormRef" :data="editingData" :edit-mode="editMode">
          </ProjectGroupForm>
        </el-tab-pane>
        <el-tab-pane label="批量增加" name="batch">
          <ProjectGroupMultiAddForm ref="projectGroupMultiAddFormRef">
          </ProjectGroupMultiAddForm>
        </el-tab-pane>
      </el-tabs>

    </template>
    <template #operations>
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
import ProjectGroupMultiAddForm from './ProjectGroupMultiAddForm.vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import { projectGroupApi } from '@/api/project-group';
import { ElMessage } from 'element-plus';

const projectGroupFormRef = ref(null);
const projectGroupMultiAddFormRef = ref(null);
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

const tab = ref('basic');
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

const handleSubmit = async () => {
  if ((tab.value === 'basic' && !projectGroupFormRef.value) || (tab.value === 'batch' && !projectGroupMultiAddFormRef.value)) {
    ElMessage.error('表单加载失败');
    return;
  }

  isSubmitting.value = true;
  try {

    const { valid, data } = tab.value === 'basic' ? await projectGroupFormRef.value.validate() : await projectGroupMultiAddFormRef.value.validate();

    if (!valid) {
      ElMessage.error(`表单验证失败${data?.error || ''}`);
      return;
    }
    console.log(valid, data)
    if (props.editMode && data.id) {
      // 编辑模式
      await projectGroupApi.editGroup(data.id, data);
      ElMessage.success('小组编辑成功');
    } else {
      // 新建模式
      if (tab.value === 'basic') {
        const response = await projectGroupApi.createGroups(data);
        emits('refresh', response.data);
        console.log(data)
        ElMessage.success('小组创建成功');
      }
      else if (tab.value === 'batch') {
        const response = await projectGroupApi.batchCreateGroups(data);
        emits('refresh', response.data?.list || []);
        console.log(data)
        ElMessage.success('小组批量创建成功');
      }
    }
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

// defineExpose({
//   projectGroupFormRef
// });
</script>
