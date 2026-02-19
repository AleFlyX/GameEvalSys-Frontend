<template>
  <!-- 创建用户的同时也可以将其添加到组别中，用一个select标签远程搜索目前已有组别，密码不得在新建用户阶段自定义？ -->
  <BaseFormModal v-bind="$attrs" @update:visible="$emit('update:visible', $event)">
    <template #title>
      创建用户
    </template>
    <template #form>
      <div class="user-add-form">
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules"
          label-width="auto">
          <el-form-item label="登陆账号" prop="username">
            <el-input v-model="ruleForm.username" type="text" autocomplete="off" />
          </el-form-item>
          <el-form-item label="用户昵称" prop="name">
            <el-input v-model="ruleForm.name" type="text" autocomplete="off" />
          </el-form-item>
          <!-- <el-form-item label="Age" prop="age">
            <el-input v-model.number="ruleForm.age" />
          </el-form-item> -->
          <el-form-item label="小组(开发中)">
            <!--
            需要启用use remote-show-suffix
            -->
            <el-select v-model="ruleForm.group" placeholder="搜索并选择所属组别" clearable>
              <el-option label="Zone one" value="shanghai" />
              <el-option label="Zone two" value="beijing" />
            </el-select>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">
              Submit
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
          </el-form-item> -->
        </el-form>
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

const ruleFormRef = ref();
const ruleForm = reactive({
  username: '',
  name: '',
})
const rules = reactive({
  name: { required: true, message: '请输入用户昵称', trigger: 'blur' },
  username: { required: true, message: '请输入用户登录账户', trigger: 'blur' }
})
</script>


<style scoped></style>
