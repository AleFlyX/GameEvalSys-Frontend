import service from "@/utils/request";
/**
 * 平台数据统计模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
 */

/**
 * @description 获取项目打分数据列表
 * @param {number}
 */
export const getProjectScoringStatistic = (projectId) => {
  return service.get(`/projects/${projectId}/statistics`);
};

/**
 * 导出项目打分数据
 */
export const exportStatisticData = () => {};
