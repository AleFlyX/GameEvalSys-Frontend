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
import { ElMessage } from 'element-plus';

import { userApi } from '@/api/user'

import { REVIEWER_LIST_RULES } from '../config/dataTableRules/projectReviewerList';

const props = defineProps({
  projectId: {
    type: [String, Number],
    default: ''
  },
  scorerIds: {
    type: Array,
    default: () => []
  }
  // reviewerGroupMembers: {
  //   type: Array,
  //   default: () => []
  // }
})

// 获取评审团成员列表
const reviewerGroupMembers = ref([])
const fetchReviewerGroupMembers = async () => {
  try {
    console.log("*--------------------", props.scorerIds)
    const params = { ids: props.scorerIds, includeDisabled: true }
    const response = await userApi.getUsersByIds(params);//batch get users

    // reviewerGroupMembers.value = response.data?.list || [];
    reviewerGroupMembers.value = response.data || [];
    console.log('获取评审团成员列表', response.data)
  } catch (err) {
    ElMessage.error(`加载评审团成员列表失败: ${err}`);
    reviewerGroupMembers.value = [];
  }
};
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
