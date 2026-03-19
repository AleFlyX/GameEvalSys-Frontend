<template>
  <div class="tab-content">
    <el-alert title="提示" type="info" description="评审团是负责对项目内的小组进行评分的专业小组。下表显示该评审团的所有成员。" :closable="false" />
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

import { userApi } from '@/api/user'

import { REVIEWER_LIST_RULES } from '../config/data-table-rules/projectReviewerList';


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
