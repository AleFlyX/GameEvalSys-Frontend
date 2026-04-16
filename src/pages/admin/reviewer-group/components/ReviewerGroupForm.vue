<template>
  <BaseForm v-bind="$attrs" ref="baseFormRef" :form-rules="REVIEWER_GROUPS_FORM_RULES" :data="initData">
    <el-form-item label="组名称" prop="name">
      <el-input v-model="clonedFormData.name" placeholder="请输入评审组名称" clearable></el-input>
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input v-model="clonedFormData.description" type="textarea" :rows="4" placeholder="请输入评审组描述（可选）"></el-input>
    </el-form-item>

    <el-form-item label="是否启用" prop="isEnabled">
      <el-switch v-model="clonedFormData.isEnabled"></el-switch>
    </el-form-item>

    <!-- 修改流程，先显示出一个确认修改按钮，点击后再弹出窗口进行修改 -->
    <el-form-item label="成员选择" prop="memberIds">
      <div class="member-selector">
        <UserSelectionTable v-model:selectedIds="clonedFormData.memberIds"
          :allowed-roles="['scorer', 'admin', 'super_admin']" :show-disabled-users="false" />
      </div>
    </el-form-item>
  </BaseForm>
</template>

<script setup>
import { ref, computed } from 'vue';

import BaseForm from '@/components/common/form/BaseForm.vue';
import UserSelectionTable from '@/components/business/user/user-selection-modal/UserSelectionTable.vue';

import { REVIEWER_GROUPS_FORM_RULES } from '../config/form-rules/reviewerGroupForm';

const props = defineProps({
  initData: {
    type: Object,
    default: () => { }
  },
})

const baseFormRef = ref(null);
const clonedFormData = computed(() => {
  return baseFormRef.value?.formData || {};
});

const dataChanged = computed(() => {
  return JSON.stringify(clonedFormData.value) !== JSON.stringify(props.initData);
})

defineExpose({
  validate: async () => {
    return await baseFormRef.value.validate();
  },
  dataChanged
})
</script>

<style scoped>
.member-selector {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
</style>
