import { ref } from 'vue';
import { ElMessage } from 'element-plus';

import { getProjectGroups } from '@/api/project-group';
import { getProjectSrocingRecds, ScoringApi } from '@/api/scoring';

/**
 * 页面数据流：小组列表、评分记录缓存、详情弹窗和刷新行为。
 * @param {Object} options
 * @param {import('vue').ComputedRef<number|null>} options.projectId
 * @param {ReturnType<typeof import('@/stores/modules/projectStore').useProjectStore>} options.projectStore
 * @param {ReturnType<typeof import('@/stores/modules/scoreStore').useScoreStore>} options.scoreStore
 */
export const useGroupScoringRecords = ({ projectId, projectStore, scoreStore }) => {
  const groupList = ref([]);
  const selectedGroup = ref(null);
  const showScoringFormDialog = ref(false);
  const showScoringDetailDialog = ref(false);
  const scoringDetails = ref([]);
  const scoringStdDetails = ref({});
  const totalScore = ref(0);

  const groupIds = ref([]);
  const scoredGroups = ref([]);

  const resetScoreDetails = () => {
    scoringDetails.value = [];
    scoringStdDetails.value = {};
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

  const syncGroupScoreStatus = () => {
    const scoredGroupIds = new Set(scoredGroups.value.map((item) => item.groupId));
    groupList.value = groupList.value.map((group) => ({
      ...group,
      scoreStatus: scoredGroupIds.has(group.id) ? 'scored' : 'not_scored',
    }));
  };

  const warmupScoringRecordsCache = () => {
    scoredGroups.value.forEach((item) => {
      const scoreItems = Array.isArray(item.scores) ? item.scores : [];
      const calcTotalScore = scoreItems.reduce((sum, scoreItem) => sum + (Number(scoreItem?.score) || 0), 0);

      scoreStore.setScoringRecordsCache(item.projectId, item.groupId, {
        scores: scoreItems,
        totalScore: Number(item.totalScore) || calcTotalScore,
      });
    });
  };

  const fetchScoringRecords = async () => {
    if (!projectId.value) return;

    try {
      const response = await getProjectSrocingRecds(projectId.value, { page: 1, size: 100 });
      const recordList = response?.data?.list || [];
      scoredGroups.value = recordList.filter((item) => groupIds.value.includes(item.groupId));

      syncGroupScoreStatus();
      warmupScoringRecordsCache();
    } catch (error) {
      ElMessage.error(`获取评分记录失败: ${error.message || error}`);
    }
  };

  const fetchGroups = async () => {
    if (!projectId.value) return;

    try {
      const response = await getProjectGroups(projectId.value);
      if (response.code !== 200 || !response.data) return;

      groupList.value = response.data.map((group) => ({
        ...group,
        scoreStatus: 'not_scored',
        lastScore: null,
      }));
      groupIds.value = response.data.map((group) => group.id);

      await fetchScoringRecords();
    } catch (error) {
      ElMessage.error(`获取小组列表失败: ${error.message || error}`);
      console.error('Error fetching groups:', error);
    }
  };

  const handleScoring = (row) => {
    selectedGroup.value = row;
    showScoringFormDialog.value = true;
  };

  const handleViewScore = async (row) => {
    selectedGroup.value = row;
    resetScoreDetails();

    const currentProjectId = Number(row.projectId || projectId.value);
    const currentGroupId = Number(row.id);

    try {
      const [cachedRecord, projectDetail] = await Promise.all([
        Promise.resolve(scoreStore.getScoringRecordsCache(currentProjectId, currentGroupId)),
        projectStore.fetchProjectDetails(currentProjectId),
      ]);

      const stdId = projectDetail?.standardId;
      scoringStdDetails.value = stdId ? await scoreStore.fetchScoreStandard(stdId) : {};

      if (cachedRecord) {
        applyRecordDetails(cachedRecord);
        showScoringDetailDialog.value = true;
        return;
      }

      const response = await ScoringApi.getScoringRecord(currentGroupId, currentProjectId);
      const recordData = response?.data || {};
      applyRecordDetails(recordData);

      scoreStore.setScoringRecordsCache(currentProjectId, currentGroupId, {
        scores: scoringDetails.value,
        totalScore: totalScore.value,
      });
    } catch (error) {
      resetScoreDetails();
      ElMessage.error(`获取评分详情失败: ${error.message || error}`);
      console.error('Error fetching scoring details:', error);
    }

    showScoringDetailDialog.value = true;
  };

  const handleRefresh = async () => {
    scoreStore.clearScoringRecordsCache(projectId.value);
    await fetchGroups();
  };

  return {
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
  };
};
