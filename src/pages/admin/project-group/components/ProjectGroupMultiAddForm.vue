<template>
  <!-- {{ multiAddData }}<span style="color: var(--el-color-primary); font-weight: bold;">（批量添加 {{
    multiAddData.endIndex - multiAddData.startIndex + 1 }} 个）</span> -->
  <el-alert type="info" :closable="false" style="margin-bottom: 10px ;">
    <template #title>
      预览：{{ multiAddData.prefixName }}{{ multiAddData.name }}{{ multiAddData.startIndex }} ~
      {{ multiAddData.prefixName }}{{ multiAddData.name }}{{ multiAddData.endIndex }}
    </template>
  </el-alert>

  <el-form ref="multiAddFormRef" label-width="auto" :model="multiAddData" :rules="REVIEWER_GROUPS_MULTI_ADD_FORM_RULES">

    <el-form-item label="小组前缀名" prop="prefixName">
      <el-input v-model="multiAddData.prefixName" placeholder="请输入小组前缀名" clearable></el-input>
    </el-form-item>

    <el-form-item label="小组名" prop="name">
      <el-input v-model="multiAddData.name" placeholder="请输入小组名称，每行一个，支持批量添加" clearable></el-input>
    </el-form-item>

    <el-form-item label="批量添加小组范围" prop="startIndex">
      <el-input-number v-model.number="multiAddData.startIndex" type="number" :min="1" :max="100"
        placeholder="请输入要批量添加的小组开始下标" clearable></el-input-number>

      <span style="margin: 0 20px; font-weight: bolder; font-size: larger;">~</span>

      <el-input-number v-model.number="multiAddData.endIndex" type="number" :min="multiAddData.startIndex" :max="100"
        placeholder="请输入要批量添加的小组结束下标" clearable></el-input-number>
    </el-form-item>

    <el-form-item label="描述（可选）" prop="description">
      <el-input v-model="multiAddData.description" type="textarea" :rows="2" placeholder="请输入小组描述（可选）"></el-input>
    </el-form-item>

    <el-form-item label="是否启用" prop="isEnabled">
      <el-switch v-model="multiAddData.isEnabled" :active-value="1" :inactive-value="0"></el-switch>
    </el-form-item>
  </el-form>

</template>
<script setup>
import { ref, watch } from 'vue';
import { REVIEWER_GROUPS_MULTI_ADD_FORM_RULES } from '../config/form/projectGroupMultiAddFormRule';
import { removeSpacesFromObject } from '@/utils/removeSpacesFromData';

const multiAddFormRef = ref(null);
const multiAddData = ref({
  prefixName: '',
  name: '小组',
  startIndex: 1,
  endIndex: 1,
  description: '',
  isEnabled: 1
});

watch(() => multiAddData.value.startIndex, (newStart) => {
  // 确保 startIndex 和 endIndex 的关系正确，避免用户输入不合理的范围
  if (newStart > multiAddData.value.endIndex) {
    multiAddData.value.endIndex = newStart;
  }
});

defineExpose({
  validate: async () => {
    try {
      multiAddData.value = removeSpacesFromObject(multiAddData.value);
      await multiAddFormRef.value.validate();
      return { valid: true, data: { ...multiAddData.value } };
    } catch (error) {
      console.error('表单验证失败:', error);
      return { valid: false, data: { error } };
    }
  }
});

</script>
