import service from "@/utils/request";
/**
 * 打分模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
 */

/**
 * @description 获取打分标准详细内容.
 * @return {Promise}
 */
export const getScoringStandardsDetails = (standardId) => {
  return service.get(`/scoring-standards/${standardId}`);
};

/**
 * @description admin 创建打分标准
 * @param {Object} params
 * @param {Array} indicators[] -指标列表
 * @param {string} indicators[].name -指标名
 * @param {string} indicators[].description -指标描述
 * @param {number} indicators[].minScore -指标最小分值
 * @param {number} indicators[].maxScore -指标最大分值
 * @returns {Promise}
 */
export const createScoringStandards = (params) => {
  return service.post("/scoring-standards", params);
};

/**
 * @description admin 编辑打分标准
 * @param {number} standardId 打分标准ID
 * @param {Object} params
 * @param {string} params.name -打分标准名
 * @param {Array} params.indicators[] -指标列表
 * @param {number} params.indicators[].id -指标ID
 * @param {string} params.indicators[].name -指标名
 * @param {string} params.indicators[].description -指标描述
 * @param {number} params.indicators[].minScore -指标最小分值
 * @param {number} params.indicators[].maxScore -指标最大分值
 * @returns {Promise}
 */
export const updateScoringStandards = (standardId, params) => {
  return service.put(`/scoring-standards/${standardId}`, params);
};

/**
 * admin 获取打分标准列表
 * @param {Object} params
 * @param {Number} params.page
 * @param {Number} params.size
 * @param {String} params.keyWords
 * @returns
 */
export const getScoringStandardsList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get("/scoring-standards", { params: defaultParams });
};

/**
 * @description 提交/修改打分
 * @param {number} projectId 项目id
 * @param {number} groupId 被打分组id
 * @param {array} scores 各个指标打分
 * @param {number} scores[].indicatorId 指标id
 * @param {number} scores[].score 指标打分值
 * @return {Promise}
 */
export const submitScoring = (params) => {
  return service.post(`/scoring/records`, params);
};

/**
 * @description 获取用户对指定小组的打分记录
 * @param {*} projectId
 * @param {*} groupId
 * @returns
 */
export const getScoringRecord = (groupId, projectId) => {
  // return service.get(`/scoring/records/${groupId}/${projectId}`);
  return service.get(`/scoring/records`, { params: { projectId: projectId, groupId: groupId } });
};

/**
 * 获取用户对当前项目的所有打分记录
 * @param {*} params
 * @returns
 */
export const getProjectSrocingRecds = (projectId, params = { page: 1, size: 10 }) => {
  return service.get(`/projects/${projectId}/records`, { params })
}

/**
 * @description 获取用户打分概览数据统计
 * @returns {Promise} 返回用户打分统计数据，包含总项目数、进行中、已完成、待完成
 */
export const getScoringOverview = () => {
  return service.get(`/scoring/overview`);
};

export const ScoringApi = {
  getScoringStandardsDetails,
  createScoringStandards,
  updateScoringStandards,
  getScoringStandardsList,
  submitScoring,
  getScoringRecord,
  getProjectSrocingRecds,
  getScoringOverview,
};
// export const adminScoringApi = {
//   createScoringStandards,
// };
