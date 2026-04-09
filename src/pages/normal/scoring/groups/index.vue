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
        <SearchInput ref="searchBarRef" @search="handleSearch" :showAddBtn="false" size="middle" immediate :delay="200">
          <template #operations>
            <MyBtn @click="handleResetSearch">重置</MyBtn>
          </template>
        </SearchInput>
      </div>

      <el-tabs v-model="activeName" class="tabs">
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
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Back } from '@element-plus/icons-vue';

import ScoreProject from './components/ScoreProject.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';
import ScoringDetails from './components/ScoringDetails.vue';

import { useProjectStore } from '@/stores/modules/projectStore';
import { useScoreStore } from '@/stores/modules/scoreStore';
import { useGroupScoringProject } from './composibles/useGroupScoringProject';
import { useGroupScoringFilters } from './composibles/useGroupScoringFilters';
import { useGroupScoringRecords } from './composibles/useGroupScoringRecords';
import { useHandleDataStatus } from './composibles/useHandleDataStatus';

const projectStore = useProjectStore();
const scoreStore = useScoreStore();
const route = useRoute();
const { projectId, projectName, warmupProjectDetails } = useGroupScoringProject(route, projectStore);
const {
  groupList,
  selectedGroup,
  showScoringFormDialog,
  showScoringDetailDialog,
  scoringDetails,
  scoringStdDetails,
  totalScore,
  fetchGroups,
  handleScoring,
  handleViewScore,
  handleRefresh,
} = useGroupScoringRecords({
  projectId,
  projectStore,
  scoreStore,
});
const {
  activeName,
  searchBarRef,
  filteredGroups,
  // handleTabClick,
  handleSearch,
  handleResetSearch,
} = useGroupScoringFilters(groupList);



// 格式化打分状态
const { formatScoreStatus, getScoreStatusTag } = useHandleDataStatus();

onMounted(() => {
  warmupProjectDetails();
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
