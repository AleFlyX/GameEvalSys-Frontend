import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/modules/projectStore';
import { useScoreStore } from '@/stores/modules/scoreStore';
import { useLoading } from '@/composables/useLodaing';

/**
 *  业务组件调用，处理业务组件所需组件数据
 */
export const useHandleInteract = () => {

  const router = useRouter();
  const projectStore = useProjectStore();
  const scoreStore = useScoreStore();

  const selectedProject = ref(null);
  const showProjectDetailDialog = ref(false);

  // 预取最多等待一小段时间，避免点击后明显阻塞
  const wait = (timeoutMs) => new Promise((resolve) => setTimeout(resolve, timeoutMs));

  // 跳转评分页前预热“项目详情 + 对应打分标准”
  const prefetchProjectAndStandard = async (projectRow) => {
    const projectId = Number(projectRow?.id);
    if (!Number.isFinite(projectId) || projectId <= 0) return;

    // 先发起项目详情请求（命中缓存则会直接返回）
    const projectRequest = projectStore.fetchProjectDetails(projectId);
    const rowStandardId = Number(projectRow?.standardId);

    if (Number.isFinite(rowStandardId) && rowStandardId > 0) {
      // 列表行自带标准ID时可并行预取，缩短总等待时间
      await Promise.all([
        projectRequest,
        scoreStore.fetchScoreStandard(rowStandardId),
      ]);
      return;
    }

    const projectDetail = await projectRequest;
    const standardId = Number(projectDetail?.standardId);
    if (Number.isFinite(standardId) && standardId > 0) {
      // 行里没有 standardId 时，退化为“详情 -> 标准”串行获取
      await scoreStore.fetchScoreStandard(standardId);
    }
  };

  // 开始打分
  const { isLoading: loadingTable, start: startTableLoading, end: endTableLoading } = useLoading('scoringList:table');
  const handleStartScoring = async (row) => {
    selectedProject.value = row;
    startTableLoading();
    const prefetchTask = prefetchProjectAndStandard(row).catch((error) => {
      console.warn('Prefetch scoring data failed:', error);
      return Promise.reject(error);
    });
    try {
      // 预取不应阻塞路由太久：最多等 300ms，之后先导航
      await Promise.race([prefetchTask, wait(300)]);
      router.push({
        name: 'projectScoring',
        params: {
          projectId: row.id,
        },
        query: {
          projectName: row.name,
        } // 自定义字段用query
      })
    } finally {
      endTableLoading();
    }
  };

  // 查看项目详情
  const handleViewDetail = (row) => {
    selectedProject.value = row;
    showProjectDetailDialog.value = true;
  };
  return {
    selectedProject,
    showProjectDetailDialog,
    loadingTable,
    handleStartScoring,
    handleViewDetail,
  }
}
