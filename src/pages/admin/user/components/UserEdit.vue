<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      编辑用户
    </template>
    <template #form>
      <div class="user-add-form">
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules"
          label-width="auto">
          <el-form-item label="登陆账号" prop="username">
            <el-input v-model="ruleForm.value.username" type="text" autocomplete="off" />
          </el-form-item>
          <el-form-item label="用户昵称" prop="name">
            <el-input v-model="ruleForm.value.name" type="text" autocomplete="off" />
          </el-form-item>
          <!-- <el-form-item label="Age" prop="age">
            <el-input v-model.number="ruleForm.age" />
          </el-form-item> -->
          <el-form-item label="小组(开发中)">
            <!--
            需要启用use remote-show-suffix
            -->
            <el-select v-model="ruleForm.value.group" placeholder="搜索并选择所属组别" clearable>
              <el-option label="Zone one" value="shanghai" />
              <el-option label="Zone two" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色">
            <!--
            需要启用use remote-show-suffix
            -->
            <el-select v-model="ruleForm.value.role" placeholder="选择角色">
              <el-option label="超级管理员" value="super_admin" />
              <el-option label="普通用户" value="normal" />
            </el-select>
          </el-form-item>
          <el-form-item label="账户状态">
            <el-switch disabled v-model="ruleForm.value.isEnabled" size="large"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt active-text="启用"
              inactive-text="停用" />
          </el-form-item>
        </el-form>
      </div>
    </template>
    <template #operations>
      <!-- <button @click="handleReset()" class="reset-btn">重置</button> -->
      <button @click="handleConfirm()" class="primary-btn">保存</button>
      <button @click="handleClose()">取消</button>
      <button @click="console.log(data)">show data</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import { reactive, ref } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {
        id: '',
        username: '',
        name: '',
        group: '',
        isEnabled: '',
        role: ''
      }
    }
  }
})

const emits = defineEmits(['update:visible'])
const handleClose = () => {
  emits('update:visible', false)
}
const ruleFormRef = ref()
const ruleForm = props.data


</script>

<style scoped></style>
