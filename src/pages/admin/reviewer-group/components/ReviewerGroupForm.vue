<template>
  <div class="reviewer-group-form-wrapper">
    <el-form ref="formRef" :model="formData" :rules="REVIEWER_GROUPS_FORM_RULES" v-bind="$attrs">
      <el-form-item label="组名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入评审组名称" clearable />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入评审组描述（可选）" />
      </el-form-item>

      <el-form-item label="是否启用" prop="isEnabled">
        <el-switch v-model="formData.isEnabled" />
      </el-form-item>

      <el-form-item label="成员选择" prop="memberIds">
        <div class="member-selector-field">
          <div class="member-selector-actions">
            <el-button type="primary" plain @click="memberSelectionVisible = true">
              选择评审成员
            </el-button>
            <span class="member-selector-summary">
              已选择 {{ selectedMembers.length }} 位成员
            </span>
          </div>

          <div v-if="selectedMembers.length" class="selected-member-list">
            <el-tag v-for="user in selectedMembers" :key="user.id" closable @close="removeSelectedMember(user.id)">
              {{ user.name || user.username || `用户${user.id}` }}
            </el-tag>
          </div>

          <el-empty v-else :image-size="70" description="暂未选择评审成员" />
        </div>
      </el-form-item>
    </el-form>

    <ReviewerMemberSelectionModal :visible="memberSelectionVisible" :selected-ids="formData.memberIds"
      :selected-users="selectedMembers" @update:visible="memberSelectionVisible = $event"
      @confirm="handleMemberSelectionConfirm" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { userApi } from '@/api/user';
import { useMessage } from '@/composables/useMessage';
import { REVIEWER_GROUPS_FORM_RULES } from '../config/form-rules/reviewerGroupForm';
import ReviewerMemberSelectionModal from './ReviewerMemberSelectionModal.vue';

const props = defineProps({
  initData: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      isEnabled: true,
      memberIds: [],
      members: []
    })
  }
});

const message = useMessage();
const formRef = ref(null);
const memberSelectionVisible = ref(false);

const createDefaultFormData = () => ({
  name: '',
  description: '',
  isEnabled: true,
  memberIds: []
});

const formData = ref(createDefaultFormData());
const selectedMembers = ref([]);
const initialSnapshot = ref('');

const normalizeUsers = (users = []) => {
  const uniqueMap = new Map();
  users.forEach((user) => {
    if (user?.id !== undefined) {
      uniqueMap.set(user.id, user);
    }
  });
  return Array.from(uniqueMap.values());
};

const syncFormData = async (sourceData) => {
  const normalizedData = {
    ...createDefaultFormData(),
    ...sourceData,
    memberIds: Array.isArray(sourceData?.memberIds) ? [...sourceData.memberIds] : []
  };

  formData.value = normalizedData;

  const directMembers = Array.isArray(sourceData?.members) ? sourceData.members : [];
  if (directMembers.length) {
    selectedMembers.value = normalizeUsers(directMembers);
  } else if (normalizedData.memberIds.length) {
    try {
      const response = await userApi.getUsersByIds({
        ids: normalizedData.memberIds,
        includeDisabled: true
      });
      selectedMembers.value = normalizeUsers(response.data || []);
    } catch (error) {
      selectedMembers.value = [];
      message.error('加载评审成员失败');
      console.error('Error loading reviewer members:', error);
    }
  } else {
    selectedMembers.value = [];
  }

  initialSnapshot.value = JSON.stringify({
    ...normalizedData,
    memberIds: [...normalizedData.memberIds].sort((a, b) => a - b)
  });
};

const handleMemberSelectionConfirm = ({ ids, users }) => {
  formData.value.memberIds = ids;
  selectedMembers.value = normalizeUsers(users);
};

const removeSelectedMember = (userId) => {
  formData.value.memberIds = formData.value.memberIds.filter(id => id !== userId);
  selectedMembers.value = selectedMembers.value.filter(user => user.id !== userId);
  formRef.value?.validateField?.('memberIds');
};

const dataChanged = computed(() => {
  const currentSnapshot = JSON.stringify({
    ...formData.value,
    memberIds: [...formData.value.memberIds].sort((a, b) => a - b)
  });
  return currentSnapshot !== initialSnapshot.value;
});

watch(
  () => props.initData,
  async (newData) => {
    await syncFormData(newData || createDefaultFormData());
  },
  { deep: true, immediate: true }
);

defineExpose({
  validate: async () => {
    try {
      await formRef.value.validate();
      return { valid: true, data: { ...formData.value, memberIds: [...formData.value.memberIds] } };
    } catch (error) {
      return { valid: false, data: { ...formData.value }, error };
    }
  },
  dataChanged
});
</script>

<style scoped>
.reviewer-group-form-wrapper {
  width: 100%;
}

.member-selector-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-selector-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.member-selector-summary {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.selected-member-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
</style>
