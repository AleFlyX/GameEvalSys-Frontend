import service from "@/utils/request";

/**
 * 项目管理模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径（已在request.js中配置）
 */

/**
 * 新建项目
 * @param {Object} params -新建项目的参数
 * @returns {Promise}
 */
const createProjet = (params) => {
  return service.post("/projects", params);
};
/**
 *
 * @param {Object} params -要获取的项目的页码
 * @returns {Promise}
 */
const getProjects = (params) => {
  return service.get("/projects", params);
};

const editProject = (params) => {
  return service.put("/projects");
};
export const projectApi = {
  createProjet,
  getProjects,
  editProject,
};
