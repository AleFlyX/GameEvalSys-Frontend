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
 * admin 获取打分标准列表
 * @returns
 */
export const getScoringStandardsList = () => {
  return service.get("/scoring-standards");
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
  return service.get(`/scoring/records/${groupId}/${projectId}`);
};

export const ScoringApi = {
  getScoringStandardsDetails,
  createScoringStandards,
  getScoringStandardsList,
  submitScoring,
  getScoringRecord,
};
// export const adminScoringApi = {
//   createScoringStandards,
// };
