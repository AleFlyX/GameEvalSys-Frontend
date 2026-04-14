import service from "@/utils/request";
/**
 * 平台数据统计模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
 */

/**
 * @description 获取平台全局统计数据（汇总所有项目）
 * 返回字段：totalProjects(项目总数) / totalScores(评分总数) / averageScore(平均得分) /
 * projectTrend(项目数趋势) / scoreTrend(得分趋势) / rateTrend(通过率趋势)
 * @returns {Promise} 平台全局统计数据
 */
export const getPlatformStatistics = () => {
  return service.get(`/statistics/platform`);
};

/**
 * @description 获取项目打分数据统计
 * @param {number} projectId - 项目ID
 * @returns {Promise} 项目打分统计数据，包含:
 *   - groupAverage: 各小组平均得分
 *   - indicatorAverage: 各指标平均得分
 *   - scorerDistribution: 评分人分布

 */
export const getProjectScoringStatistic = (projectId) => {
  return service.get(`/projects/${projectId}/statistics`);
};

/**
 * @description 获取项目内指定小组的指标平均分明细
 * @param {number} projectId - 项目ID
 * @param {number} groupId - 小组ID
 * @returns {Promise} 小组指标平均分数据
 */
export const getProjectGroupIndicatorStatistic = (projectId, groupId) => {
  return service.get(`/projects/${projectId}/statistics/groups/${groupId}`);
};

/**
 * @description 导出项目打分数据
 * @param {number} projectId - 项目ID
 * @param {string} format - 导出格式（excel/csv，默认excel）
 * @returns {Promise} 文件流
 */
export const exportProjectStatisticData = (projectId, format = 'excel') => {
  return service.get(`/projects/${projectId}/export`, {
    params: {
      format
    },
    responseType: 'blob' // 返回二进制数据
  });
};

export const exportProjectGroupIndicatorsData = (projectId, format = 'excel') => {
  return service.get(`/projects/${projectId}/export/group-indicator-items`, {
    params: {
      format
    },
    responseType: 'blob'
  });
};
