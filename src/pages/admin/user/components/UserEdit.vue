<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      编辑用户
    </template>
    <template #form>
      <div class="user-add-form">
        <UserForm v-bind="$attrs"></UserForm>
        <!-- <el-form ref="ruleFormRef" style="max-width: 600px" :model="formData" status-icon :rules="rules"
          label-width="auto">
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
              <el-option label="普通用户" value="normal" />
            </el-select>
          </el-form-item>
          <el-form-item label="账户状态">
            <el-switch disabled v-model="formData.isEnabled" size="large"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
              inactive-text="停用" />
          </el-form-item>
        </el-form> -->
      </div>
    </template>
    <template #operations>
      <!-- <button @click="handleReset()" class="reset-btn">重置</button> -->
      <button @click="handleConfirm()" class="primary-btn">保存</button>
      <button @click="handleClose()">取消</button>
      <!-- <button @click="console.log(`UserEdit DATA CLONED  ${formData.value}`)">show data</button> -->
    </template>
  </BaseFormModal>
</template>

<script setup>
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';

import { ref } from 'vue';

import UserForm from './UserForm.vue';

const props = defineProps({
  // data: {
  //   type: Object,
  //   default: () => ({
  //     id: '114514',
  //     username: 'ec',
  //     name: 'ccb',
  //     group: '3',
  //     isEnabled: true,
  //     role: 'admin'
  //   })
  // }
})

const emits = defineEmits(['update:visible'])
const handleClose = () => {
  emits('update:visible', false)
}


// const ruleFormRef = ref()

// 初始化表单数据（安全克隆，不会报错）
// const formData = ref(safeDeepClone(props.data.value));//数据拷贝structuredClone API

// // 监听 props 变化，同步更新（同样用安全克隆）
// watch(
//   () => props.data,
//   (newVal) => {
//     formData.value = safeDeepClone(newVal.value);
//     // console.log(safeDeepClone(newVal.value))
//   },
//   { deep: true, immediate: true }
// );
// console.log(`UserEdit DATA CLONED${ruleForm.value}`)


</script>

<style scoped></style>
