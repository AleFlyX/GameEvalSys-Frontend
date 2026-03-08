<template>
  <div class="tab-content">
    <el-form ref="reviewerFormRef" :model="formData" :rules="reviewerFormRules" label-width="120px" status-icon>
      <el-form-item label="选择评审团" prop="reviewerGroupId">
        <el-select v-model="formData.reviewerGroupId" placeholder="更改负责此项目评分的评审团" clearable
          @change="handleReviewerGroupChange">
          <el-option v-for="item in reviewerGroupOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <div class="reviewer-tips">
      <el-alert title="提示" type="info" description="评审团是负责对项目内的小组进行评分的专业小组。下表显示该评审团的所有成员。" :closable="false" />
    </div>
    <div class="reviewer-members">
      <!-- <div v-if="formData.reviewerGroupId" class="reviewer-members"> -->
      <h4>评审团成员</h4>
      <el-table :data="reviewerGroupMembers" stripe style="width: 100%">
        <el-table-column prop="id" label="成员ID" width="80" />
        <el-table-column prop="username" label="成员名称" width="150" />
        <el-table-column prop="name" label="成员名称" width="150" />

        <el-table-column prop="createTime" label="加入时间" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEditMember(scope.row)">
              编辑
            </el-button>
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
    <!-- <div v-else class="empty-state">
                <p>请先选择评审团</p>
              </div> -->
  </div>
</template>
<script setup>

</script>

<style scoped>
.tab-content {
  padding: 20px 0;
}

.groups-tips,
.reviewer-tips {
  margin-top: 24px;
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
