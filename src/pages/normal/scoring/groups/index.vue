<template>
  <div class="group-scoring-container">
    <div class="modal-title">
      <MyBtn type="primary" @click="$router.push('/scoring')">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </MyBtn>
      <h3>{{ projectName }} - 评分列表</h3>
    </div>

    <div class="modal-body">
      <!-- 搜索框 -->
      <div class="search-section">
        <SearchInput></SearchInput>
      </div>

      <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
        <el-tab-pane label="未评分" name="not_scored">
          未评分

        </el-tab-pane>
        <el-tab-pane label="已评分" name="scored">
          已评分
        </el-tab-pane>
      </el-tabs>

      <!-- 小组列表 -->
      <div class="group-list">
        <el-empty v-if="filteredGroups.length === 0" description="暂无小组数据"></el-empty>
        <el-table v-else :data="filteredGroups" stripe style="width: 100%; font-size: 12px">
          <el-table-column prop="id" label="小组ID" min-width="100"></el-table-column>
          <el-table-column prop="name" label="小组名称" min-width="100"></el-table-column>
          <el-table-column prop="scoreStatus" label="打分状态" min-width="80">
            <template #default="{ row }">
              <el-tag :type="getScoreStatusTag(row.scoreStatus)">
                {{ formatScoreStatus(row.scoreStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="lastScore" label="最后打分时间" min-width="120">
            <template #default="{ row }">
              {{ row.lastScore || '-' }}
            </template>
          </el-table-column> -->
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <div style="display: flex;">
                <el-button size="small" type="primary" link @click="handleScoring(row)">
                  {{ activeName == 'not_scored' ? '打分' : '重新打分' }}
                </el-button>
                <el-button v-if="row.scoreStatus === 'scored'" size="small" type="link" @click="handleViewScore(row)">
                  查看
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

  </div>

  <!-- 打分表单模态框 -->
  <ScoreProject v-model:visible="showScoringFormDialog" :project-id="projectId" :project-name="projectName"
    :group-data="selectedGroup" @refresh="handleRefresh">
  </ScoreProject>
  <ScoringDetails v-model:visible="showScoringDetailDialog" :selected-group="selectedGroup"
    :scoring-details="scoringDetails" :scoring-std-details="scoringStdDetails" :total-score="totalScore">
  </ScoringDetails>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Back } from '@element-plus/icons-vue';

import { useChangeTables } from './composibles/useChangeTables';

import { ElMessage } from 'element-plus';

import ScoreProject from './components/ScoreProject.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';
import ScoringDetails from './components/ScoringDetails.vue';

import { getProjectGroups } from '@/api/project-group';
import { getProjectSrocingRecds } from '@/api/scoring';
import { ScoringApi } from '@/api/scoring';
import { useProjectStore } from '@/stores/modules/projectStore';
import { useScoreStore } from '@/stores/modules/scoreStore';

const {
  activeName,
} = useChangeTables();
const projectStore = useProjectStore();
const scoreStore = useScoreStore();

const searchKeyword = ref('');
const groupList = ref([]);
const selectedGroup = ref(null);
const showScoringFormDialog = ref(false);
const showScoringDetailDialog = ref(false);
const scoringDetails = ref([]);
const scoringStdDetails = ref({})
const totalScore = ref(0);

const route = useRoute();
const projectId = computed(() => {
  const id = Number(route.params.projectId);
  return Number.isFinite(id) && id > 0 ? id : null;
});
const projectName = computed(() => {
  const queryProjectName = route.query.projectName;
  if (typeof queryProjectName === 'string' && queryProjectName.trim()) {
    return queryProjectName;
  }
  // query 没有项目名时，回退读取项目详情缓存
  const cachedProject = projectStore.getProjectDetails(projectId.value);
  return cachedProject?.name || '项目';
});

const filteredGroups = computed(() => {
  const groupsByTab = groupList.value.filter((group) => {
    if (activeName.value === 'scored') return group.scoreStatus === 'scored';
    return group.scoreStatus !== 'scored';
  });

  if (!searchKeyword.value) return groupsByTab;
  return groupsByTab.filter((group) => group.name.includes(searchKeyword.value));
});

const handleClick = () => {
  // tab 切换由 activeName 控制，过滤逻辑在 filteredGroups 中处理
};

const groupIds = ref([]);
const scoredGroups = ref([]);

// 获取项目的小组列表
const fetchGroups = async () => {
  if (!projectId.value) return;

  try {
    const response = await getProjectGroups(projectId.value);
    if (response.code === 200 && response.data) {
      groupList.value = response.data.map(group => ({
        ...group,
        scoreStatus: 'not_scored',
        lastScore: null
      }));
      groupIds.value = response.data.map(group => group.id);
      await fetchScoringStds();
    }
  } catch (error) {
    ElMessage.error('获取小组列表失败: ' + error);
    console.error('Error fetching groups:', error);
  }
};


const fetchScoringStds = async () => {
  if (!projectId.value) return;

  try {
    const response = await getProjectSrocingRecds(projectId.value, { page: 1, size: 20 });
    const recordList = response?.data?.list || [];
    scoredGroups.value = recordList.filter(item => groupIds.value.includes(item.groupId));

    const scoredGroupIds = new Set(scoredGroups.value.map(item => item.groupId));
    groupList.value = groupList.value.map((group) => ({
      ...group,
      scoreStatus: scoredGroupIds.has(group.id) ? 'scored' : 'not_scored',
    }));

    // 预热每个小组的评分详情缓存，"查看" 时优先命中，减少重复请求
    scoredGroups.value.forEach((item) => {
      const scoreItems = Array.isArray(item.scores) ? item.scores : [];
      const calcTotalScore = scoreItems.reduce((sum, scoreItem) => sum + (Number(scoreItem?.score) || 0), 0);
      scoreStore.setScoringRecordsCache(item.projectId, item.groupId, {
        scores: scoreItems,
        totalScore: Number(item.totalScore) || calcTotalScore,
      });
    });
  }
  catch (err) {
    console.log(err)
  }
};

// 处理打分
const handleScoring = (row) => {
  selectedGroup.value = row;
  // console.log(row)
  showScoringFormDialog.value = true;
};

const resetScoreDetails = () => {
  scoringDetails.value = [];
  totalScore.value = 0;
};

const applyRecordDetails = (recordData) => {
  const scoreItems = Array.isArray(recordData)
    ? recordData
    : (Array.isArray(recordData?.scores) ? recordData.scores : []);

  scoringDetails.value = scoreItems;

  const totalScoreFromRecord = Number(recordData?.totalScore);
  if (Number.isFinite(totalScoreFromRecord)) {
    totalScore.value = totalScoreFromRecord;
    return;
  }
  totalScore.value = scoreItems.reduce((sum, item) => sum + (Number(item?.score) || 0), 0);
};

// 查看打分详情
const handleViewScore = async (row) => {
  selectedGroup.value = row;
  const currentProjectId = Number(row.projectId || projectId.value);
  const currentGroupId = Number(row.id);

  try {
    // 优先读缓存（L1/L2），命中后直接展示详情
    const cachedRecord = scoreStore.getScoringRecordsCache(currentProjectId, currentGroupId);
    const projectDetail = await projectStore.fetchProjectDetails(currentProjectId);
    const stdId = projectDetail.standardId;
    scoringStdDetails.value = await scoreStore.fetchScoreStandard(stdId)

    console.error(cachedRecord, projectDetail, scoringStdDetails.value)
    if (cachedRecord) {
      applyRecordDetails(cachedRecord);
      showScoringDetailDialog.value = true;
      return;
    }

    const response = await ScoringApi.getScoringRecord(currentGroupId, currentProjectId);
    const recordData = response?.data || {};
    applyRecordDetails(recordData);

    // API 兜底后回写缓存，供后续重复查看复用
    scoreStore.setScoringRecordsCache(currentProjectId, currentGroupId, {
      scores: scoringDetails.value,
      totalScore: totalScore.value,
    });
  }
  catch (err) {
    console.log(err)
    resetScoreDetails();
  }
  showScoringDetailDialog.value = true;
};

// 刷新列表
const handleRefresh = () => {
  // 提交评分后，先清掉当前项目下所有小组评分缓存，再重新拉取
  scoreStore.clearScoringRecordsCache(projectId.value);
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


onMounted(() => {
  // 预热项目详情缓存，给标题和后续评分流程使用
  projectStore.fetchProjectDetails(projectId.value).catch(() => undefined);
  fetchGroups();
});
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
</style>
