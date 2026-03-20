<template>
  <BaseForm ref="baseFormRef" :form-rules="REVIEWER_GROUPS_FORM_RULES" :data="initData">
    <el-form-item label="小组名称" prop="name">
      <el-input v-model="clonedFormData.name" placeholder="请输入小组名称" clearable></el-input>
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input v-model="clonedFormData.description" type="textarea" :rows="4" placeholder="请输入小组描述（可选）"></el-input>
    </el-form-item>

    <el-form-item label="是否启用" prop="isEnabled">
      <el-switch v-model="clonedFormData.isEnabled" :active-value="1" :inactive-value="0"></el-switch>
    </el-form-item>
  </BaseForm>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BaseForm from '@/components/common/form/BaseForm.vue';
import { REVIEWER_GROUPS_FORM_RULES } from '../config/form/projectGroupFormRule';
import { safeDeepClone } from '@/utils/proxyDataClone';

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

// 初始化数据 - 深拷贝避免修改原数据
const initData = safeDeepClone(props.data);

const clonedFormData = reactive(safeDeepClone(props.data || {
  name: '',
  description: '',
  isEnabled: 1
}));

// 暴露验证方法给父组件
const validate = async () => {
  try {
    await baseFormRef.value.validate();
    return { valid: true, data: { ...clonedFormData } };
  } catch (err) {
    console.error('Form Validate Error:', err);
    return { valid: false, data: null };
  }
};

defineExpose({
  validate
});
</script>
