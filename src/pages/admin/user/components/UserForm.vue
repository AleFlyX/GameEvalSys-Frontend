<template>
  <BaseForm ref="baseFormRef" :form-rules="userFormRules" :data="props.initData" style="max-width: 800px" status-icon
    label-width="auto" @update:data="handleChangedData">
    <el-form-item v-if="!editMode" label="登陆账号" prop="username">
      <el-input v-model="formData.username" type="text" autocomplete="off" />
    </el-form-item>
    <div v-if="!editMode">
      <el-alert type="info" show-icon :closable="false" style="margin: 10px;">
        <p>若不设定密码,则默认为123456</p>
      </el-alert>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="text" autocomplete="off" placeholder="请输入登录密码" />
      </el-form-item>
    </div>
    <el-form-item label="用户昵称" prop="name">
      <el-input v-model="formData.name" type="text" autocomplete="off" />
    </el-form-item>
    <el-form-item label="评审团" prop="reviewerGroup">
      <!-- <el-select v-model="formData.group" placeholder="搜索并选择所属组别" clearable disabled>
        <el-option label="Zone one" value="shanghai" />
        <el-option label="Zone two" value="beijing" />
      </el-select> -->
      <el-select v-model="formData.reviewerGroupId" filterable placeholder="查找该用户要加入的评审团" :loading="loading" remote
        :remote-method="getReviewerGroupList" debounce="300" style="width: 240px">
        <el-option v-for="item in reviewerGroups" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item label="角色" prop="role">
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
  </BaseForm>
</template>

<script setup>
import { ref, computed } from 'vue';

import BaseForm from '@/components/common/form/BaseForm.vue';

import { groupApi } from '@/api/group';

import { userFormRules } from '../utils/userFormRules';
const props = defineProps({
  initData: {
    type: Object,
    default: () => ({
      id: '',
      username: '',
      password: '',
      name: '',
      reviewerGroupId: '',
      isEnabled: true,
      role: 'normal'
    })
  },
  // remoteMethod: {
  //   type: Function
  // },
  // reviewerGroups: {
  //   type: Array,
  //   default: () => []
  // },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:data', 'update:keywords'])

const baseFormRef = ref(null)

// 通过 computed 获取 BaseForm 的 formData，避免创建重复的数据对象
const formData = computed(() => {
  return baseFormRef.value?.formData || {};
})

const loading = ref(false)
const reviewerGroups = ref([])
const getReviewerGroupList = async (keywords) => {
  loading.value = true;
  console.log('searching reviewer group list', keywords)
  try {
    const response = await groupApi.getReviewerGroupList({ keyWords: keywords })
    reviewerGroups.value = response.data;
    loading.value = false;
  } catch (err) {
    console.log(err)
  }
}
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
