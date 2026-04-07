<template>
  <div class="tab-content">
    <el-alert title="提示" type="info" description="评审团是负责对项目内的小组进行评分的专业小组。下表显示该评审团的所有成员。" :closable="false" />

    <div class="add-member-section">
      <el-select v-model="selectedMemberId" filterable remote reserve-keyword placeholder="搜索并选择成员"
        :remote-method="remoteSearchUsers" :loading="usersLoading" clearable style="width: 300px;">
        <el-option v-for="user in usersOptions" :key="user.id" :label="user.name" :value="user.id"
          :disabled="reviewerGroupMembers.some(m => m.id === user.id)">
          <span style="float: left">{{ user.name }}</span>
          <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
            {{ user.role }}
          </span>
        </el-option>
      </el-select>

      <el-button type="primary" style="margin-left: 10px;" :disabled="!selectedMemberId" @click="handleAddMember">
        添加成员
      </el-button>
    </div>

    <div class="reviewer-members">
      <h4>评审团成员</h4>
      <el-table :data="reviewerGroupMembers" stripe style="width: 100%">
        <DataTableColums :col-rules="REVIEWER_LIST_RULES"></DataTableColums>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <!-- <el-button size="small" type="primary" @click="handleEditMember(scope.row)">
              编辑
            </el-button> -->
            <el-button size="small" type="danger" @click="handleDeleteMember(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="reviewerGroupMembers.length === 0" class="empty-state">
        <p>暂无评审团成员</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';

import DataTableColums from '@/components/common/data/DataTableColums.vue';
import { showMsgBox } from '@/utils/ConfirmBox';
import { ElMessage } from 'element-plus';

import { userApi } from '@/api/user'
import { useLoading } from '@/composables/useLodaing';

import { REVIEWER_LIST_RULES } from '../config/data-table/projectReviewerList';

const props = defineProps({
  projectId: {
    type: [String, Number],
    default: ''
  },
  scorerIds: {
    type: Array,
    default: () => []
  },
  scorerCache: {
    type: Array,
    default: () => []
  },
  editedAtLocal: {  // 如果已经在本地编辑过一次了，说明已经初始化一次数据了，无需再向后端获取数据
    type: Boolean,
    default: false
  }
})
const emits = defineEmits([
  'successNotice',//通知父组件显示成功响应
  'errorNotice', //通知父组件显示报错
  'edited', //已经在本地被编辑过了
  'update:scorerIds'//更新小组id的表单数据
])

// 获取评审团成员列表
const reviewerGroupMembers = ref([])

// 成员选择相关
const selectedMemberId = ref(null)
const usersOptions = ref([])
const { isLoading: usersLoading, start: startUsersLoading, end: endUsersLoading } = useLoading('projectReviewGroups:search')

const fetchReviewerGroupMembers = async () => {
  if (props.editedAtLocal) {
    reviewerGroupMembers.value = props.scorerCache;
    return;
  }
  try {
    console.log("*--------------------", props.scorerIds)
    const params = { ids: props.scorerIds, includeDisabled: true }
    const response = await userApi.getUsersByIds(params);//batch get users

    // reviewerGroupMembers.value = response.data?.list || [];
    reviewerGroupMembers.value = response.data || [];
    console.log('获取评审团成员列表', response.data)
  } catch (err) {
    emits('errorNotice', `加载评审团成员列表失败: ${err}`);
    reviewerGroupMembers.value = [];
  }
};

// 远程搜索用户
const remoteSearchUsers = async (query) => {
  if (query === '') {
    usersOptions.value = [];
    return;
  }

  startUsersLoading();
  try {
    const response = await userApi.getUserList({
      page: 1,
      size: 100,
      keyWords: query
    });

    if (response.code === 200 && response.data) {
      usersOptions.value = response.data.list || [];
    }
  } catch (error) {
    console.error('Error searching users:', error);
    ElMessage.error('获取用户列表失败');
    usersOptions.value = [];
  } finally {
    endUsersLoading();
  }
};

// 添加成员
const handleAddMember = async () => {
  if (!selectedMemberId.value) {
    ElMessage.warning('请先选择成员');
    return;
  }

  // 查找选中的用户信息
  const selectedUser = usersOptions.value.find(u => u.id === selectedMemberId.value);

  if (!selectedUser) {
    ElMessage.error('用户信息获取失败');
    return;
  }

  // 检查是否已经在列表中
  if (reviewerGroupMembers.value.some(m => m.id === selectedMemberId.value)) {
    ElMessage.warning('该成员已在列表中');
    selectedMemberId.value = null;
    return;
  }

  // 添加到列表
  reviewerGroupMembers.value.push(selectedUser);

  // 更新父组件数据
  emits('update:scorerIds', reviewerGroupMembers.value.map(item => item.id));
  emits('successNotice', '添加 ' + selectedUser.name + ' 成功');
  emits('edited', { edited: true, cache: reviewerGroupMembers.value });

  // 清空选择
  selectedMemberId.value = null;
  usersOptions.value = [];
};

const handleDeleteMember = (row) => {
  showMsgBox('提示', '确定要将用户 ' + row.name + ' 移出该项目', {
    type: 'danger',
  })
    .then(() => {
      const scorerId = row.id;
      const filteredScorers = reviewerGroupMembers.value.filter(item => item.id !== scorerId);
      const filteredScorerIds = filteredScorers.map(item => item.id);
      reviewerGroupMembers.value = filteredScorers;
      emits('edited', { edited: true, cache: filteredScorers });
      console.log(filteredScorers)
      emits('update:scorerIds', filteredScorerIds);
    }).catch(() => {
      console.log('取消')
    })
}

onMounted(() => {
  fetchReviewerGroupMembers()
})

</script>

<style scoped>
.tab-content {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
}

.form-actions :deep(.el-button) {
  min-width: 100px;
}

.add-member-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  margin-top: 15px;
}

.reviewer-members {
  margin-top: 24px;
}

.reviewer-members h4 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
