<template>
  <base-form ref="UserFormRef" :form-rules="userFormRules" :data="props.data" style="max-width: 800px" status-icon
    label-width="auto" @update:data="handleChangedData">
    <el-form-item label="登陆账号" prop="username">
      <el-input v-model="formData.username" type="text" autocomplete="off" />
    </el-form-item>
    <el-form-item label="用户昵称" prop="name">
      <el-input v-model="formData.name" type="text" autocomplete="off" />
    </el-form-item>
    <el-form-item label="小组(开发中)">
      <!--
      需要启用use remote-show-suffix
      -->
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
import { ref } from 'vue';
import { userFormRules } from '../utils/userFormRules';//表格规则
import BaseForm from '@/components/common/form/BaseForm.vue';
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      id: '114514',
      username: 'ec',
      name: 'ccb',
      group: '3',
      isEnabled: true,
      role: 'admin'
    })
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits([
  'update:data'
])

const UserFormRef = ref(null)
defineExpose({
  validate: async () => {
    return await UserFormRef.value.validate();
  }
})

const formData = ref({})
const handleChangedData = (newVal) => {
  formData.value = { ...formData.value, ...newVal };
}
</script>
