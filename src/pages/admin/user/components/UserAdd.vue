<template>
  <!-- 创建用户的同时也可以将其添加到组别中，用一个select标签远程搜索目前已有组别，密码不得在新建用户阶段自定义？ -->
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      <el-switch v-model="multiAddMode" active-text="批量添加" inactive-text="单用户添加" size="large"></el-switch>
    </template>
    <template #form>
      <!-- <el-tabs v-model="activeTab">
        <el-tab-pane label="1" name="singleAdd">
          assa
        </el-tab-pane>
        <el-tab-pane label="2" name="multiAdd">
          bbb
        </el-tab-pane>
      </el-tabs> -->
      <div class="user-add-form" v-show="!multiAddMode">
        <UserForm v-bind="$attrs" :editMode="false" :multiAdd="multiAddMode" ref="formRef"
          :remote-method="getReviewerGroupList" :disabled="disableBehavior">
        </UserForm>
      </div>
      <div class="user-multi-add" v-show="multiAddMode">
        <UserMultiAddForm ref="multiAddFormRef" :remote-method="getReviewerGroupList"></UserMultiAddForm>
      </div>
    </template>
    <template #operations>
      <!-- <button @click="handleReset()" class="reset-btn">重置</button> -->
      <button @click="handleConfirm()" class="primary-btn" :disabled="disableBehavior">确认</button>
      <button @click="handleClose()">取消</button>
    </template>
  </BaseFormModal>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

import BaseFormModal from '@/components/common/modal/BaseFormModal.vue';
import UserForm from './UserForm.vue';

import { userApi } from '@/api/user'

import UserMultiAddForm from './UserMultiAddForm.vue';

defineOptions({
  inheritAttrs: false
})

defineProps({})

const emits = defineEmits([
  'update:visible',
  'refresh'
])

const handleClose = () => {
  emits('update:visible', false);
}

const multiAddMode = ref(false);
const formRef = ref();
const multiAddFormRef = ref()
const disableBehavior = ref(false)

const createUser = async (valid, data) => {
  disableBehavior.value = true;

  if (valid) {
    console.log('表单校验通过：', data);
    const defaultPassword = '123456';
    if (data.password == '') {
      data.password = defaultPassword;
      ElMessage.info('该用户使用默认密码注册')
    }
    const dataList = [];
    dataList.push(data);
    const requestObj = { users: dataList }
    // 后续调用接口等逻辑
    try {
      const response = await userApi.createUser(requestObj);
      ElMessage.success(`${response.message}`);
      handleClose();
      emits('refresh', true);
    }
    catch (err) {
      ElMessage.error(`保存用户编辑信息错误${err.message}`)
    }
    finally {
      disableBehavior.value = false;
    }
    // disableBehavior.value = false;
  }
  else {
    disableBehavior.value = false;
    ElMessage.error('请完善表单数据')
  }
}

const multiCreateUser = async (valid, dataList) => {
  disableBehavior.value = true;

  if (valid) {
    console.log('表单校验通过：', dataList);

    // const requestObj = { users: dataList }

    // 后续调用接口等逻辑
    try {
      // console.log('requestObj', requestObj)
      const response = await userApi.createUser(dataList);
      ElMessage.success(`${response.message}`);
      handleClose();
      emits('refresh', true);
    }
    catch (err) {
      ElMessage.error(`保存用户编辑信息错误${err.message}`)
    }
    finally {
      disableBehavior.value = false;
    }
    // disableBehavior.value = false;
  }
  else {
    disableBehavior.value = false;
    ElMessage.error('请完善表单数据')
  }
}

const handleConfirm = async () => {
  if (!multiAddMode.value) {
    if (!formRef.value) return; // 兜底 避免组件未挂载时调用
    ElMessage.info(`创建单用户`)
    const { valid, data } = await formRef.value.validate();  //通过 formRef.value 访问子组件暴露的方法
    createUser(valid, data);

  }
  else {
    if (!multiAddFormRef.value) return; // 兜底 避免组件未挂载时调用
    ElMessage.info(`批量创建用户`)
    const { valid, data } = multiAddFormRef.value.validate();
    multiCreateUser(valid, data)
  }
}

onMounted(() => {

})

</script>


<style scoped></style>
