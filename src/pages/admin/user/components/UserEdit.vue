<template>
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      编辑用户
    </template>
    <template #form>
      <div class="user-add-form">
        <UserForm v-bind="$attrs" @update:data="handleFormData" editMode ref="formRef"></UserForm>
      </div>
    </template>
    <template #operations>
      <!-- <button @click="handleReset()" class="reset-btn">重置</button> -->
      <button @click="handleConfirm()" class="primary-btn" :disabled="disableBtn">保存</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>
</template>

<script setup>
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import UserForm from './UserForm.vue';

import { userApi } from '@/api/user'

import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({})

const emits = defineEmits(['update:visible', 'refresh'])
const handleClose = () => {
  emits('update:visible', false)
}

const formRef = ref(null);
const disableBtn = ref(false)
const handleConfirm = async () => {
  disableBtn.value = true;
  //通过 formRef.value 访问子组件暴露的方法
  if (!formRef.value) return; // 兜底 避免组件未挂载时调用

  const { valid, data } = await formRef.value.validate();
  if (valid) {
    console.log('表单校验通过：', data);
    // 后续调用接口等逻辑
    try {
      const response = await userApi.editUser(data.id, data);
      ElMessage.success(`${response.message}`)
      emits('refresh', true)
    }
    catch (err) {
      ElMessage.error(`保存用户编辑信息错误${err}`)
    }
    finally {
      disableBtn.value = false;
    }

  }
  else {
    ElMessage.error('请完善表单数据')
  }
}
</script>

<style scoped></style>
