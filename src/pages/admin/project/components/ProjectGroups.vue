<template>
  <div class="tab-content">
    <div class="groups-tips">
      <el-alert title="提示" type="info" description="本表格显示该项目关联的所有小组。可以编辑小组信息或删除不再需要的小组。" :closable="false" />
    </div>
    <el-table :data="groupsList" stripe style="margin-top: 20px; width: 100%">
      <el-table-column prop="id" label="小组ID" width="auto" />
      <el-table-column prop="name" label="小组名称" width="auto" />
      <el-table-column prop="createTime" label="创建时间" width="auto" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEditGroup(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteGroup(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="groupsList.length === 0" class="empty-state">
      <p>暂无关联小组</p>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  groupsList: {
    type: Array,
    default: () => []
  }
})
</script>
<style scoped>
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
}

.form-actions :deep(.el-button) {
  min-width: 100px;
}
</style>
