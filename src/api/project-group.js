import service from "@/utils/request";

export const getGroupList = (params = {}) => {
  const defaultParams = { page: 1, size: 10, ...params };
  return service.get('/groups', { params: defaultParams })
};

export const createGroups = () => {

};

/**
 * 获取项目受评分的小组列表
 * @param {number} projectId - 项目ID
 * @returns {Promise} 响应数据（小组列表）
 */
export const getProjectGroups = (projectId) => {
  return service.get(`/projects/${projectId}/groups`);
};

export const projectGroupApi = {
  getGroupList,
  createGroups,
  getProjectGroups,

}
