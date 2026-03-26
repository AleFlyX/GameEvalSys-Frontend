import { ref } from 'vue';
import { useRouter } from 'vue-router';
/**
 *
 */
export const useHandleTable = () => {

  const router = useRouter();
  const selectedProject = ref(null);
  const showProjectDetailDialog = ref(false);
  // 开始打分
  const handleStartScoring = (row) => {
    selectedProject.value = row;
    // showGroupScoringDialog.value = true;
    router.push({
      name: 'projectScoring',
      params: {
        projectId: row.id,
      },
      query: {
        projectName: row.name,
      } // 自定义字段用query
    })

  };

  // 查看项目详情
  const handleViewDetail = (row) => {
    selectedProject.value = row;
    showProjectDetailDialog.value = true;
  };
  return {
    selectedProject,
    showProjectDetailDialog,
    handleStartScoring,
    handleViewDetail,
  }
}
