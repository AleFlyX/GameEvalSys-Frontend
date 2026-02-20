<template>
  <!-- 创建用户的同时也可以将其添加到组别中，用一个select标签远程搜索目前已有组别，密码不得在新建用户阶段自定义？ -->
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      创建用户
    </template>
    <template #form>
      <div class="user-add-form">
        <UserForm v-bind="$attrs">

        </UserForm>
      </div>
    </template>
    <template #operations>
      <!-- <button @click="handleReset()" class="reset-btn">重置</button> -->
      <button @click="handleConfirm()" class="primary-btn">确认</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>

</template>

<script setup>
import { reactive, ref } from 'vue';
import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import UserForm from './UserForm.vue';
defineOptions({
  inheritAttrs: false
})

defineProps({})

const emits = defineEmits([
  'update:visible'
])

const handleClose = () => {
  emits('update:visible', false);
}

const handleConfirm = () => {
  //post api
}

</script>


<style scoped></style>
