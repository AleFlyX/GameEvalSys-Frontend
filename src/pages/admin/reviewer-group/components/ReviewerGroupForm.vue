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

    <el-form-item label="成员选择" prop="memberIds">
      <div class="member-selector">
        <el-select v-model="clonedFormData.memberIds" placeholder="选择评审组成员" clearable filterable multiple
          :loading="loadingUsers" remote :remote-method="fetchAvailableMembers" debounce="300">
          <el-option v-for="member in availableMembers" :key="member.id" :label="member.labelText" :value="member.id">
          </el-option>
        </el-select>
        <div class="member-count">已选择: {{ clonedFormData.memberIds?.length || 0 }} 人</div>
      </div>
    </el-form-item>
  </BaseForm>
</template>

<script setup>
import { ref, computed } from 'vue';

import BaseForm from '@/components/common/form/BaseForm.vue';

import { userApi } from '@/api/user';
import { useMessage } from '@/composables/useMessage';
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

const message = useMessage();

const loadingUsers = ref(false)
const availableMembers = ref([]);
// 获取可用成员列表
const fetchAvailableMembers = async (kWords) => {
  loadingUsers.value = true;
  try {
    const templateParam = { page: 1, size: 20 }
    // if (keyWords) templateParam = { keyWords: keywords };
    if (kWords) templateParam.keyWords = kWords;

    const response = await userApi.getUserList(templateParam);
    if (response.code === 200 && response.data?.list) {
      // 过滤出打分员和管理员
      availableMembers.value = response.data.list
        .filter(u => ['scorer', 'admin', 'super_admin'].includes(u.role))
        .map(u => ({
          id: u.id,
          labelText: `${u.name} (${u.username}) - ${u.role}`
        }));
    }
  } catch (error) {
    message.error('获取成员列表失败: ' + error);
    console.error('Error fetching members:', error);
    // 使用mock数据
    availableMembers.value = [
      // { id: 2, labelText: '打分员01 (scorer01) - scorer' },
      // { id: 3, labelText: '打分员02 (scorer02) - scorer' },
      // { id: 4, labelText: '打分员03 (scorer03) - scorer' },
      // { id: 5, labelText: '打分员04 (scorer04) - scorer' }
    ];
  } finally {
    loadingUsers.value = false;
  }
};

defineExpose({
  validate: async () => {
    return await baseFormRef.value.validate();
  },
})
</script>
