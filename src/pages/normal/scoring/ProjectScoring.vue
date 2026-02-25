<template>

  <div class="group-scoring-container">
    <div class="modal-title">
      <h3>{{ projectName }} - 评分列表</h3>
    </div>

    <div class="modal-body">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input v-model="searchKeyword" placeholder="搜索小组名称..." style="width: 100%">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <!-- 小组列表 -->
      <div class="group-list">
        <el-empty v-if="filteredGroups.length === 0" description="暂无小组数据"></el-empty>
        <el-table v-else :data="filteredGroups" stripe style="width: 100%; font-size: 12px">
          <el-table-column prop="name" label="小组名称" min-width="100"></el-table-column>
          <el-table-column prop="scoreStatus" label="打分状态" min-width="80">
            <template #default="{ row }">
              <el-tag :type="getScoreStatusTag(row.scoreStatus)">
                {{ formatScoreStatus(row.scoreStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastScore" label="最后打分时间" min-width="120">
            <template #default="{ row }">
              {{ row.lastScore || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="handleScoring(row)">
                打分
              </el-button>
              <el-button v-if="row.scoreStatus === 'scored'" size="small" type="link" @click="handleViewScore(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

  </div>

  <!-- 打分表单模态框 -->
  <ScoringForm v-model:visible="showScoringFormDialog" :project-id="projectData?.id" :group-id="selectedGroup?.id"
    :group-name="selectedGroup?.name" :project-name="projectData?.name" @refresh="handleRefresh"
    @submit="handleScoringSubmit">
  </ScoringForm>


</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ScoringForm from '@/components/business/ScoringForm.vue';
import { projectApi } from '@/api/project';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const searchKeyword = ref('');
const groupList = ref([]);
const selectedGroup = ref(null);
const showScoringFormDialog = ref(false);
const showScoringDetailDialog = ref(false);
const scoringDetails = ref([]);
const totalScore = ref(0);

const route = useRoute();
const projectName = computed(() => route.query.projectName || '项目');

const filteredGroups = computed(() => {
  if (!searchKeyword.value) {
    return groupList.value;
  }
  return groupList.value.filter(group =>
    group.name.includes(searchKeyword.value)
  );
});

// 获取项目的小组列表
const fetchGroups = async () => {
  if (!route.params.projectId) return;

  try {
    const response = await projectApi.getProjectGroups(route.params.projectId);
    if (response.code === 200 && response.data) {
      groupList.value = response.data.map(group => ({
        ...group,
        scoreStatus: 'not_scored', // not_scored, scored
        lastScore: null
      }));
    }
  } catch (error) {
    ElMessage.error('获取小组列表失败: ' + error);
    console.error('Error fetching groups:', error);
  }
};

// 处理打分
const handleScoring = (row) => {
  selectedGroup.value = row;
  showScoringFormDialog.value = true;
};

// 查看打分详情
const handleViewScore = (row) => {
  selectedGroup.value = row;
  // 这里应该根据projectData.id和row.id获取具体的打分记录
  const mockScores = [
    { id: 1, name: '复杂程度', score: 4, minScore: 1, maxScore: 5 },
    { id: 2, name: '创新性', score: 3, minScore: 1, maxScore: 5 },
    { id: 3, name: '完成度', score: 5, minScore: 1, maxScore: 5 }
  ];
  scoringDetails.value = mockScores;
  totalScore.value = mockScores.reduce((sum, item) => sum + item.score, 0);
  showScoringDetailDialog.value = true;
};

// 打分提交
const handleScoringSubmit = () => {
  // 更新小组的打分状态
  const groupIndex = groupList.value.findIndex(g => g.id === selectedGroup.value.id);
  if (groupIndex !== -1) {
    groupList.value[groupIndex].scoreStatus = 'scored';
    groupList.value[groupIndex].lastScore = new Date().toLocaleString();
  }
  ElMessage.success('打分成功');
  handleRefresh();
};

// 刷新列表
const handleRefresh = () => {
  fetchGroups();
};

// 格式化打分状态
const formatScoreStatus = (status) => {
  const statusMap = {
    'not_scored': '未打分',
    'scored': '已打分'
  };
  return statusMap[status] || status;
};

const getScoreStatusTag = (status) => {
  const typeMap = {
    'not_scored': 'info',
    'scored': 'success'
  };
  return typeMap[status] || 'info';
};

// 监听visible变化
// watch(() => props.visible, (newVal) => {
//   visible.value = newVal;
//   if (newVal) {
//     fetchGroups();
//   }
// });

// watch(visible, (newVal) => {
//   emit('update:visible', newVal);
// });

// onMounted(() => {
//   if (props.visible) {
//     fetchGroups();
//   }
// });
</script>

<style scoped>
.group-scoring-container,
.scoring-detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 650px;
}

.modal-title {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.modal-body {
  max-height: 500px;
  overflow-y: auto;
  padding: 0 8px;
}

.search-section {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.group-list {
  margin-top: 12px;
}

.scoring-detail {
  padding: 12px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.detail-item label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 20px;
}

.score-value {
  color: var(--primary);
  font-weight: 600;
  font-size: 16px;
  margin: 0 10px;
}

.score-range {
  color: #909399;
  font-size: 12px;
}

.total-score {
  display: flex;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  align-items: center;
}

.total-score label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 20px;
}

.total-score span {
  color: var(--danger);
  font-weight: 600;
  font-size: 18px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
