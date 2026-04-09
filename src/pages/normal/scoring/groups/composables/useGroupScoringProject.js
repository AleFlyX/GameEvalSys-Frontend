import { computed } from 'vue';

/**
 * 项目上下文：统一管理项目 id、名称和详情预热。
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route
 * @param {ReturnType<typeof import('@/stores/modules/projectStore').useProjectStore>} projectStore
 */
export const useGroupScoringProject = (route, projectStore) => {
  const projectId = computed(() => {
    const id = Number(route.params.projectId);
    return Number.isFinite(id) && id > 0 ? id : null;
  });

  const projectName = computed(() => {
    const queryProjectName = route.query.projectName;
    if (typeof queryProjectName === 'string' && queryProjectName.trim()) {
      return queryProjectName;
    }

    const cachedProject = projectStore.getProjectDetails(projectId.value);
    return cachedProject?.name || '项目';
  });

  const warmupProjectDetails = async () => {
    if (!projectId.value) return null;

    try {
      return await projectStore.fetchProjectDetails(projectId.value);
    } catch {
      return null;
    }
  };

  return {
    projectId,
    projectName,
    warmupProjectDetails,
  };
};
