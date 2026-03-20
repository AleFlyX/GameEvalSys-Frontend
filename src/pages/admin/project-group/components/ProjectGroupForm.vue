<template>
  <BaseForm ref="baseFormRef" :form-rules="REVIEWER_GROUPS_FORM_RULES" :data="propData">
    <el-form-item label="小组名称" prop="name">
      <el-input v-model="formDataLocal.name" placeholder="请输入小组名称" clearable></el-input>
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input v-model="formDataLocal.description" type="textarea" :rows="4" placeholder="请输入小组描述（可选）"></el-input>
    </el-form-item>

    <el-form-item label="是否启用" prop="isEnabled">
      <el-switch v-model="formDataLocal.isEnabled" :active-value="1" :inactive-value="0"></el-switch>
    </el-form-item>
  </BaseForm>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import BaseForm from '@/components/common/form/BaseForm.vue';
import { REVIEWER_GROUPS_FORM_RULES } from '../config/form/projectGroupFormRule';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      isEnabled: 1
    })
  },
  editMode: {
    type: Boolean,
    default: false
  }
});

const baseFormRef = ref(null);

// 使用 props.data 或创建默认对象
const propData = ref(props.data || { name: '', description: '', isEnabled: 1 });

// 本地响应式数据，与 BaseForm 同步
const formDataLocal = reactive({
  name: props.data?.name || '',
  description: props.data?.description || '',
  isEnabled: props.data?.isEnabled ?? 1
});

// 监听 props.data 变化
watch(() => props.data, (newData) => {
  if (newData) {
    propData.value = newData;
    formDataLocal.name = newData.name || '';
    formDataLocal.description = newData.description || '';
    formDataLocal.isEnabled = newData.isEnabled ?? 1;
  }
}, { deep: true });

// 监听表单数据变化，同时更新 BaseForm 的 formData
watch(formDataLocal, (newVal) => {
  if (baseFormRef.value?.formData) {
    baseFormRef.value.formData.name = newVal.name;
    baseFormRef.value.formData.description = newVal.description;
    baseFormRef.value.formData.isEnabled = newVal.isEnabled;
  }
}, { deep: true });

// 暴露验证方法给父组件
const validate = async () => {
  return await baseFormRef.value.validate();
};

defineExpose({
  validate
});
</script>
