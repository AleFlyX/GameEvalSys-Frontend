<template>
  <base-form ref="baseFormRef" :form-rules="userFormRules" :data="props.initData" style="max-width: 800px" status-icon
    label-width="auto" @update:data="handleChangedData">
    <el-form-item label="登陆账号" prop="username">
      <el-input v-model="formData.username" type="text" autocomplete="off" />
    </el-form-item>
    <el-form-item label="用户昵称" prop="name">
      <el-input v-model="formData.name" type="text" autocomplete="off" />
    </el-form-item>
    <el-form-item label="小组(开发中)">
      <el-select v-model="formData.group" placeholder="搜索并选择所属组别" clearable>
        <el-option label="Zone one" value="shanghai" />
        <el-option label="Zone two" value="beijing" />
      </el-select>
    </el-form-item>
    <el-form-item label="角色">
      <el-select v-model="formData.role" placeholder="选择角色">
        <el-option label="超级管理员" value="super_admin" />
        <el-option label="管理员" value="admin" />
        <el-option label="打分用户" value="scorer" />
        <el-option label="普通用户" value="normal" />
      </el-select>
    </el-form-item>
    <el-form-item label="账户状态" v-if="editMode">
      <el-switch v-model="formData.isEnabled" size="large"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
        inactive-text="停用" />
    </el-form-item>
  </base-form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { userFormRules } from '../utils/userFormRules';
import BaseForm from '@/components/common/form/BaseForm.vue';

const props = defineProps({
  initData: {
    type: Object,
    default: () => ({
      id: '',
      username: '',
      name: '',
      group: '',
      isEnabled: true,
      role: 'normal'
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
