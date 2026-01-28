// 导入封装好的axios实例
import service from "@/utils/request.js";

/**
 * 用户模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径（已在request.js中配置）
 */
export const userApi = {
  /**
   * 登录接口
   * @param {Object} params - 登录参数
   * @param {string} params.username - 用户名
   * @param {string} params.password - 密码
   * @returns {Promise} - 返回登录结果（包含token）
   */
  login: (params) => {
    return service.post("/auth/login", params);
  },

  /**
   * 退出登录
   * @returns {Promise}
   */
  logout: () => {
    return service.post("/auth/logout");
  },

  /**
   * 获取用户列表（分页）
   * @param {Object} params - 分页/筛选参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页条数
   * @param {string} [params.role] - 角色筛选（super_admin/admin/scorer/normal）
   * @returns {Promise} - 返回用户列表数据
   */
  getUserList: (params = {}) => {
    // 设置默认参数，避免传参缺失
    const defaultParams = { page: 1, size: 10, ...params };
    return service.get("/users", { params: defaultParams });
  },

  /**
   * 创建新用户
   * @param {Object} data - 用户信息
   * @param {string} data.username - 用户名（唯一）
   * @param {string} data.password - 密码
   * @param {string} data.name - 真实姓名
   * @param {string} data.role - 角色
   * @param {boolean} [data.isEnabled=true] - 是否启用
   * @returns {Promise}
   */
  createUser: (data) => {
    return service.post("/users", data);
  },

  /**
   * 编辑用户信息
   * @param {number} userId - 用户ID
   * @param {Object} data - 要修改的用户信息（非全量，传需要改的字段即可）
   * @param {string} [data.name] - 真实姓名
   * @param {string} [data.role] - 角色
   * @param {boolean} [data.isEnabled] - 是否启用
   * @returns {Promise}
   */
  editUser: (userId, data) => {
    return service.put(`/users/${userId}`, data);
  },

  /**
   * 删除用户
   * @param {number} userId - 用户ID
   * @returns {Promise}
   */
  deleteUser: (userId) => {
    return service.delete(`/users/${userId}`);
  },

  /**
   * 获取当前登录用户信息
   * （扩展接口，如需实现可在后端添加 /users/current 接口）
   * @returns {Promise}
   */
  getCurrentUser: () => {
    return service.get("/users/current");
  },
};

// 导出默认值，支持两种导入方式：
// 1. import { userApi } from '@/api/user.js'
// 2. import userApi from '@/api/user.js'
export default userApi;
