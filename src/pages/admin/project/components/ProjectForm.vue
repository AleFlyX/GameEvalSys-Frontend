<template>
  <base-form ref="baseFormRef" :form-rules="projectFormRules" :data="props.data" style="max-width: 800px" status-icon
    label-width="auto" @update:data="handleChangedData">

    <el-form-item label="项目名称" prop="name">
      <el-input v-model="formData.name" type="text" placeholder="请输入项目名称" />
    </el-form-item>

    <el-form-item label="项目描述" prop="description">
      <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
    </el-form-item>

    <el-form-item label="开始日期" prop="startDate">
      <el-date-picker v-model="formData.startDate" type="date" placeholder="选择项目开始日期" value-format="YYYY-MM-DD" />
    </el-form-item>

    <el-form-item label="结束日期" prop="endDate">
      <el-date-picker v-model="formData.endDate" type="date" placeholder="选择项目结束日期" value-format="YYYY-MM-DD" />
    </el-form-item>

    <el-form-item label="打分标准" prop="standardId">
      <el-select v-model="formData.standardId" placeholder="选择打分标准" clearable>
        <el-option label="标准一" :value="1" />
        <el-option label="标准二" :value="2" />
      </el-select>
    </el-form-item>

    <el-form-item label="关联小组" prop="groupIds">
      <el-select v-model="formData.groupIds" placeholder="选择关联的小组" multiple clearable>
        <el-option label="第一组" :value="1" />
        <el-option label="第二组" :value="2" />
      </el-select>
    </el-form-item>

    <el-form-item label="打分用户" prop="scorerIds">
      <el-select v-model="formData.scorerIds" placeholder="选择可参与打分的用户" multiple clearable>
        <el-option label="用户1" :value="1" />
        <el-option label="用户2" :value="2" />
      </el-select>
    </el-form-item>

    <el-form-item label="启用状态" v-if="editMode">
      <el-switch v-model="formData.isEnabled" size="large"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
        inactive-text="停用" />
    </el-form-item>

  </base-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { projectFormRules } from '../utils/projectFormRules';
import BaseForm from '@/components/common/form/BaseForm.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      id: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      standardId: '',
      groupIds: [],
      scorerIds: [],
      isEnabled: true,
      status: 'not_started'
    })
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:data'])

const baseFormRef = ref(null)

// 通过 computed 获取 BaseForm 的 formData，避免创建重复的数据对象
const formData = computed(() => {
  return baseFormRef.value?.formData || {};
})

defineExpose({
  validate: async () => {
    return await baseFormRef.value.validate();
  }
})

// 当 BaseForm 发出数据更新时转发给父组件
const handleChangedData = (newVal) => {
  emits('update:data', newVal);
}
</script>
