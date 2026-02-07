import service from "@/utils/request";

/**
 * 项目管理模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
 */

/**
 * @param {Object} data - 请求体参数
 * @param {string} data.name - 项目名称（必填）
 * @param {string} [data.description=''] - 项目描述（可选）
 * @param {string} data.startDate - 起始日期 YYYY-MM-DD（必填）
 * @param {string} data.endDate - 结束日期 YYYY-MM-DD（必填）
 * @param {boolean} [data.isEnabled=true] - 是否启用（可选，默认true）
 * @param {number} data.standardId - 关联打分标准ID（必填）
 * @param {number[]} data.groupIds - 关联小组ID列表（必填）
 * @param {number[]} data.scorerIds - 可参与打分的用户ID列表（必填）
 * @returns {Promise} 响应数据（包含项目id等信息）
 */
export const createProjet = (params) => {
  return service.post("/projects", params);
};

/**
 * 获取项目列表（带分页、筛选）
 * @param {Object} [params={}] - Query参数（可选）
 * @param {number} [params.page=1] - 页码（默认1）
 * @param {number} [params.size=10] - 每页条数（默认10）
 * @param {string} [params.status] - 项目状态 not_started/ongoing/ended
 * @param {boolean} [params.isEnabled] - 是否启用
 * @returns {Promise} 响应数据（列表+总数）
 */
export const getProjectList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get("/projects", { params: defaultParams });
};

/**
 * 编辑项目
 * @param {number} projectId - 路径参数：项目ID（必填）
 * @param {Object} data - 请求体参数（同创建，所有字段非必填）
 * @param {string} [data.name] - 项目名称
 * @param {string} [data.description] - 项目描述
 * @param {string} [data.startDate] - 起始日期 YYYY-MM-DD
 * @param {string} [data.endDate] - 结束日期 YYYY-MM-DD
 * @param {boolean} [data.isEnabled] - 是否启用
 * @param {number} [data.standardId] - 关联打分标准ID
 * @param {number[]} [data.groupIds] - 关联小组ID列表
 * @param {number[]} [data.scorerIds] - 可参与打分的用户ID列表
 * @returns {Promise} 响应数据
 */
export const editProject = (projectId, params) => {
  return service.put(`/projects/${projectId}`, params);
};

/**
 * 删除项目
 * @param {*} projectId -要删除的项目id
 * @param {*} params
 * @returns
 */
export const deleteProject = (projectId, params = {}) => {
  return service.delete(`/projects/${projectId}`, params);
};

/**
 * 结束项目
 * @param {number} projectId - 路径参数：项目ID（必填）
 * @returns {Promise} 响应数据
 */
export const endProject = (projectId) => {
  return service.post(`/projects/${projectId}/end`);
};

/**
 * 获取单个项目详情
 * @param {number} projectId - 路径参数：项目ID（必填）
 * @returns {Promise} 响应数据（项目完整详情）
 */
export const getProjectDetail = (projectId) => {
  return service.get(`/projects/${projectId}`);
};

/**
 * 获取当前用户授权可访问的项目列表
 * @param {string} userId - userId
 * @returns {Promise} -response data
 */
export const getAuthorizedProjectList = (userId) => {
  return service.get(`/projects/${userId}`);
};

export const projectApi = {
  createProjet,
  getProjectList,
  editProject,
  deleteProject,
  endProject,
  getProjectDetail,
  getAuthorizedProjectList,
};
