<template>
  <SelectionModalShell :visible="visible" width="82%" min-height="75%" :allow-mask-close="false"
    @update:visible="handleVisibleChange">
    <template #title>
      <div class="dialog-title-wrap">
        <h3>选择评审组成员</h3>
        <p>支持按用户名、昵称和角色筛选，已选成员会在表单中同步回显</p>
      </div>
    </template>

    <template #summary>
      <div class="summary-item">
        <span>已选成员</span>
        <strong>{{ selectedIdsDraft.length }}</strong>
      </div>
    </template>

    <template #toolbar>
      <div class="toolbar-actions">
        <el-button size="small" :disabled="selectedIdsDraft.length === 0"
          @click="() => { selectedIdsDraft = [] }">清空全部</el-button>
      </div>
    </template>

    <template #preview>
      <div v-if="selectedUsersDraft.length" class="selected-preview">
        <span class="preview-label">已选成员：</span>
        <div class="tag-list">
          <el-tag v-for="user in selectedUsersDraft" :key="user.id" closable @close="removeSelectedUser(user.id)">
            {{ user.name || user.username || `用户${user.id}` }}
          </el-tag>
        </div>
      </div>
    </template>

    <template #table>
      <UserSelectionTable v-model:selectedIds="selectedIdsDraft" :allowed-roles="['scorer', 'admin', 'super_admin']"
        :show-disabled-users="false" />
    </template>

    <template #operations>
      <button class="primary-btn" @click="handleConfirm">确认选择</button>
      <button class="cancel-btn" @click="handleVisibleChange(false)">取消</button>
    </template>
  </SelectionModalShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import UserSelectionTable from '@/components/business/user/user-selection-modal/UserSelectionTable.vue';
import SelectionModalShell from '@/components/common/modal/SelectionModalShell.vue';
import { userApi } from '@/api/user';
import { useMessage } from '@/composables/useMessage';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  selectedUsers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'confirm']);

const message = useMessage();
const selectedIdsDraft = ref([]);
const selectedUsersMap = ref(new Map());

const selectedUsersDraft = computed(() => {
  return selectedIdsDraft.value
    .map(id => selectedUsersMap.value.get(id))
    .filter(Boolean);
});

const syncDraftFromProps = async () => {
  selectedIdsDraft.value = Array.isArray(props.selectedIds) ? [...props.selectedIds] : [];
  selectedUsersMap.value = new Map();

  if (Array.isArray(props.selectedUsers)) {
    props.selectedUsers.forEach((user) => {
      if (user?.id !== undefined) {
        selectedUsersMap.value.set(user.id, user);
      }
    });
  }

  await ensureSelectedUsersLoaded();
};

const ensureSelectedUsersLoaded = async () => {
  if (!selectedIdsDraft.value.length) {
    return;
  }

  const missingIds = selectedIdsDraft.value.filter(id => !selectedUsersMap.value.has(id));
  if (!missingIds.length) {
    return;
  }

  try {
    const response = await userApi.getUsersByIds({
      ids: missingIds,
      includeDisabled: true
    });
    const users = response.data || [];
    users.forEach((user) => {
      selectedUsersMap.value.set(user.id, user);
    });
  } catch (error) {
    message.error('加载已选成员失败');
    console.error('Error loading selected users:', error);
  }
};

const removeSelectedUser = (userId) => {
  selectedIdsDraft.value = selectedIdsDraft.value.filter(id => id !== userId);
};

const handleConfirm = async () => {
  await ensureSelectedUsersLoaded();
  emit('confirm', {
    ids: [...selectedIdsDraft.value],
    users: selectedUsersDraft.value
  });
  emit('update:visible', false);
};

const handleVisibleChange = (value) => {
  emit('update:visible', value);
};

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      await syncDraftFromProps();
    }
  }
);

watch(
  () => props.selectedIds,
  async () => {
    if (!props.visible) {
      await syncDraftFromProps();
    }
  },
  { deep: true }
);

watch(
  () => props.selectedUsers,
  async () => {
    if (!props.visible) {
      await syncDraftFromProps();
    }
  },
  { deep: true }
);

watch(
  () => selectedIdsDraft.value,
  async () => {
    await ensureSelectedUsersLoaded();
  },
  { deep: true }
);
</script>

<style scoped>
</style>
