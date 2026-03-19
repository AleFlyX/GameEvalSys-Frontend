<template>
  <PagePanel>
    <template #header>
      <div class="stats-header">
        <OverviewCard icon="User" title="总评审组数" :data="overViewCardsMap.totalGroups" icon-color="var(--primary-havy)"
          icon-background="var(--primary-light)" width="23%">
        </OverviewCard>
        <OverviewCard icon="UserFilled" title="活跃评审组" :data="overViewCardsMap.activeGroups" icon-color="var(--success)"
          icon-background="var(--success-light)" width="23%">
        </OverviewCard>
        <OverviewCard icon="Users" title="总成员数" :data="overViewCardsMap.totalMembers" icon-color="var(--warning)"
          icon-background="var(--warning-light)" width="23%">
        </OverviewCard>
        <OverviewCard icon="Management" title="平均组规模" :data="overViewCardsMap.avgGroupSize" icon-color="var(--info)"
          icon-background="var(--info-light)" width="23%">
        </OverviewCard>
      </div>
    </template>

    <SearchInput size="middle" placeholder="搜索评审组名称..." @search="handleSearch" @add="handleAdd">
    </SearchInput>

    <template #main-table>
      <div class="data-table">
        <el-table :data="tableData" stripe style="width: 100%">
          <DataTableColums :col-rules="COLUMN_RULES"></DataTableColums>
          <el-table-column label="操作" width="auto" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">查看详情</el-button>
              <el-button v-if="scope.row.isEnabled" size="small" type="danger"
                @click="handleChangeStatus(false, scope.row)">
                禁用
              </el-button>
              <el-button v-else size="small" type="success" @click="handleChangeStatus(true, scope.row)">
                启用
              </el-button>
              <!-- <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <template #footer>
      <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.size"
        :page-sizes="[10, 20, 30]" size="middle" :disabled="paginationDisabled" :total="totalData"
        @size-change="handleSizeChange" layout="sizes, prev, pager, next" @current-change="handleCurrentChange" />
    </template>

    <template #modals>
      <!-- 创建/编辑评审组 -->
      <ReviewerGroupOperation v-model:visible="showAddDialog" :edit-data="editingData" @refresh="handleRefresh">
      </ReviewerGroupOperation>

      <!-- 查看详情 -->
      <ReviererGroupDetails v-model:visible="showDetailDialog" :selected-group="selectedGroup">
      </ReviererGroupDetails>
    </template>
  </PagePanel>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import PagePanel from '@/layouts/PagePanel.vue';
import OverviewCard from '@/components/common/data/OverviewCard.vue';
import SearchInput from '@/components/common/data/SearchInput.vue';
import DataTableColums from '@/components/common/data/DataTableColums.vue';
import ReviererGroupDetails from './components/ReviererGroupDetails.vue';
import ReviewerGroupOperation from './components/ReviewerGroupOperation.vue';

import { COLUMN_RULES } from './config/data-table-rules/reviewerGroupList';
import { reviewerGroupApi } from '@/api/reviewer-group';
import { ElMessage } from 'element-plus';
import { showMsgBox } from '@/utils/ConfirmBox';

// 统计数据
const overViewCardsMap = reactive({
  totalGroups: '0',
  activeGroups: '0',
  totalMembers: '0',
  avgGroupSize: '0'
});

// 分页参数
const pageParams = reactive({
  page: 1,
  size: 10,
});

const totalData = ref(0);
const paginationDisabled = ref(false);
const tableData = ref([]);
const searchKeyword = ref('');

// 模态框相关
const showAddDialog = ref(false);
const showDetailDialog = ref(false);

const editingData = ref(null);
const selectedGroup = ref(null);

// 获取评审组列表
const fetchGroupList = async () => {
  try {
    paginationDisabled.value = true;
    const response = await reviewerGroupApi.getReviewerGroupList({
      page: pageParams.page,
      size: pageParams.size,
      name: searchKeyword.value || undefined
    });

    if (response.code === 200 && response.data) {
      console.log(response.data)
      tableData.value = response.data || [];
      console.log(tableData.value)
      // totalData.value = response.data.total || 0;
      calculateStats();
    }
  } catch (error) {
    ElMessage.error('获取评审组列表失败: ' + error);
    console.error('Error fetching group list:', error);
  } finally {
    paginationDisabled.value = false;
  }
};

// 计算统计数据
const calculateStats = () => {
  if (!tableData.value || tableData.value.length === 0) {
    overViewCardsMap.totalGroups = '0';
    overViewCardsMap.activeGroups = '0';
    overViewCardsMap.totalMembers = '0';
    overViewCardsMap.avgGroupSize = '0';
    return;
  }

  const activeCount = tableData.value.filter(g => g.isEnabled).length;
  const totalMembers = tableData.value.reduce((sum, g) => sum + (g.memberIds?.length || 0), 0);
  const avgSize = tableData.value.length > 0 ? (totalMembers / tableData.value.length).toFixed(1) : '0';

  overViewCardsMap.totalGroups = String(totalData.value);
  overViewCardsMap.activeGroups = String(activeCount);
  overViewCardsMap.totalMembers = String(totalMembers);
  overViewCardsMap.avgGroupSize = avgSize;
};

// 搜索处理
const handleSearch = (keyword) => {
  searchKeyword.value = keyword;
  pageParams.page = 1;
  fetchGroupList();
};

// 添加评审组
const handleAdd = () => {
  editingData.value = null;
  showAddDialog.value = true;
};

// 编辑评审组
const handleEdit = (row) => {
  editingData.value = row;
  showAddDialog.value = true;
};

// 查看详情
const handleViewDetail = (row) => {
  selectedGroup.value = row;
  showDetailDialog.value = true;
};

// 修改状态
const handleChangeStatus = async (newStatus, row) => {
  try {
    await showMsgBox('提示', (newStatus ? '确认启用 ' : '确认禁用 ') + '评审团' + row.name, { type: 'warning' });
    await reviewerGroupApi.editReviewerGroup(row.id, { isEnabled: newStatus });
    ElMessage.success(newStatus ? '启用成功' : '禁用成功');
    handleRefresh();
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error('操作失败: ' + error);
  }
};

// 分页处理
const handleSizeChange = (newSize) => {
  pageParams.size = newSize;
  pageParams.page = 1;
  fetchGroupList();
};

const handleCurrentChange = (newPage) => {
  pageParams.page = newPage;
  fetchGroupList();
};

// 刷新列表
const handleRefresh = () => {
  fetchGroupList();
};

// 初始化
onMounted(() => {
  fetchGroupList();
});
</script>

<style scoped>
.stats-header {
  width: 100%;
  display: flex;
  /* gap: 20px; */
  margin-bottom: 20px;
}

.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
