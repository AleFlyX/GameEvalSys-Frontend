import service from "@/utils/request";

/**
 * 评审组管理模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
 */

/**
 * 创建评审组
 * @param {Object} params
 * @param {string} params.name - 评审组名称（必填）
 * @param {string} [params.description=''] - 评审组描述（可选）
 * @param {boolean} [params.isEnabled=true] - 是否启用（可选，默认true）
 * @param {number[]} params.memberIds - 评审组成员ID列表（必填）
 * @returns {Promise} 响应数据（包含评审组id等信息）
 */
export const createReviewerGroup = (params) => {
  return service.post("/reviewer-groups", params);
};

/**
 * 获取评审组列表（分页/模糊搜索）
 * @param {Object} [params={}] - Query参数（可选）
 * @param {number} [params.page=1] - 页码（默认1）
 * @param {number} [params.size=10] - 每页条数（默认10）
 * @param {string} [params.keywords] - 评审组名称搜索
 * @param {boolean} [params.isEnabled] - 是否启用
 * @returns {Promise} 响应数据（列表+总数）
 */
export const getReviewerGroupList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  // console.log(defaultParams)
  return service.get("/reviewer-groups", { params: defaultParams });
};

/**
 * 获取评审组概览统计
 * @returns {Promise}
 */
export const getReviewerGroupOverview = () => {
  return service.get('/reviewer-groups/overview');
};

/**
 * 获取评审组详情
 * @param {number} groupId - 路径参数：评审组ID（必填）
 * @returns {Promise} 响应数据（评审组完整详情）
 */
export const getReviewerGroupDetail = (groupId) => {
  return service.get(`/reviewer-groups/${groupId}`);
};

/**
 * 编辑评审组
 * @param {number} groupId - 路径参数：评审组ID（必填）
 * @param {Object} params - 请求体参数（同创建，所有字段非必填）
 * @param {string} [params.name] - 评审组名称
 * @param {string} [params.description] - 评审组描述
 * @param {boolean} [params.isEnabled] - 是否启用
 * @param {number[]} [params.memberIds] - 评审组成员ID列表
 * @returns {Promise} 响应数据
 */
export const editReviewerGroup = (groupId, params) => {
  return service.put(`/reviewer-groups/${groupId}`, params);
};

/**
 * 删除评审组
 * @param {number} groupId - 路径参数：评审组ID（必填）
 * @returns {Promise} 响应数据
 */
export const deleteReviewerGroup = (groupId) => {
  return service.delete(`/reviewer-groups/${groupId}`);
};

export const reviewerGroupApi = {
  createReviewerGroup,
  getReviewerGroupList,
  getReviewerGroupOverview,
  getReviewerGroupDetail,
  editReviewerGroup,
  deleteReviewerGroup
};
