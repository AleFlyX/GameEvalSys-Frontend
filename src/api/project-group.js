import service from "@/utils/request";

/**
 * 获取所有被打分的小组列表
 * @param {*} params
 * @param {Number} page 页码
 * @param {Number} size 每页
 * @param {String} keyWords -模糊搜索关键词
 * @returns
 */
export const getGroupList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get('/groups', { params: defaultParams })
};

/**
 * 创建项目小组
 * @param {Object} params
 * @param {String} params.name
 * @param {String} params.description
 * @param {String} params.isEnabled
 */
export const createGroups = (params) => {
  return service.post('/groups', params)
};

/**
 * 获取项目受评分的小组列表
 * @param {number} projectId - 项目ID
 * @returns {Promise} 响应数据（小组列表）
 */
export const getProjectGroups = (projectId) => {
  return service.get(`/projects/${projectId}/groups`);
};

/**
 * 获取小组详情
 * @param {number} groupId - 小组ID
 * @returns {Promise} 响应数据
 */
export const getGroupDetail = (groupId) => {
  return service.get(`/groups/${groupId}`);
};

/**
 * 编辑小组
 * @param {number} groupId - 小组ID
 * @param {Object} params - 请求参数
 * @returns {Promise} 响应数据
 */
export const editGroup = (groupId, params) => {
  return service.put(`/groups/${groupId}`, params);
};

/**
 * 将小组与项目关联
 * @param {Object}
 */
export const groupAddToProject = () => {
  return service.post()
}

export const projectGroupApi = {
  getGroupList,
  createGroups,
  getProjectGroups,
  getGroupDetail,
  editGroup,
}
