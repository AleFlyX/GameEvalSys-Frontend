// 导入封装好的axios实例
import service from "@/utils/request.js";

/**
 * 用户模块 API 集合
 * 所有接口路径均基于 /api/v1 基础路径（已在request.js中配置）
 */
export const userApi = {
  /**
   * @description 登录接口
   * @param {Object} params - 登录参数
   * @param {string} params.username - 用户名
   * @param {string} params.password - 密码
   * @returns {Promise} - 返回登录结果（包含token）
   */
  login: (params) => {
    return service.post("/auth/login", params);
  },

  /**
   * 刷新 Token（JWT 轮换）
   * @param {Object} params
   * @param {string} params.sid
   * @param {string} params.refreshToken
   * @returns {Promise}
   */
  refreshToken: (params) => {
    return service.post("/auth/refresh", params);
  },

  /**
   * 退出登录
   * @returns {Promise}
   */
  logout: () => {
    return service.post("/auth/logout");
  },

  /**
   * 我的会话列表
   * @returns {Promise}
   */
  getMySessions: () => {
    return service.get("/auth/sessions/me");
  },

  /**
   * 管理端在线用户列表
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.size=10]
   * @param {string} [params.role]
   * @param {string} [params.keyWords]
   * @param {boolean} [params.isEnabled]
   * @param {boolean} [params.onlineOnly]
   * @returns {Promise}
   */
  getOnlineUsers: (params = {}) => {
    const defaultParams = { page: 1, size: 10, ...params };
    return service.get("/admin/online-users", { params: defaultParams });
  },

  /**
   * 踢指定会话下线
   * @param {string} sid
   * @returns {Promise}
   */
  kickSessionBySid: (sid) => {
    return service.post(`/admin/sessions/${sid}/kick`);
  },

  /**
   * 查询指定用户会话列表
   * @param {number|string} userId
   * @returns {Promise}
   */
  getAdminSessionsByUser: (userId) => {
    return service.get("/admin/sessions", { params: { userId } });
  },

  /**
   * 踢用户全部会话下线
   * @param {number|string} userId
   * @returns {Promise}
   */
  kickAllSessionsByUser: (userId) => {
    return service.post(`/admin/users/${userId}/kick-all`);
  },

  /**
   * 获取用户列表（分页/模糊搜索）
   * @param {Object} params - 分页/筛选参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页条数
   * @param {string} [params.role] - 角色筛选（super_admin/admin/scorer/normal）
   * @param {Boolean} [params.isEnabled] -状态筛选（true/false）
   * @param {string} [params.keyWords] - 模糊查询关键字
   * @returns {Promise} - 返回用户列表数据
   */
  getUserList: (params = {}) => {
    // 设置默认参数，避免传参缺失
    const defaultParams = { page: 1, size: 10, ...params };
    return service.get("/users", { params: defaultParams });
  },

  /**
   * 获取用户概览统计（用于管理端状态卡）
   * @returns {Promise}
   */
  getUserOverview: () => {
    return service.get('/users/overview');
  },

  /**
   * 按照用户id数组批量获取用户信息
   * @param {Object} params
   * @param {Boolean} params.includeDisabled -是否显示被禁用的用户
   * @param {Array} params.ids -需要批量查询的用户id（上限100位）
   * @returns
   */
  getUsersByIds: (params = { includeDisabled: false, ids: [] }) => {
    return service.post("/users/batch-query", params)
  },

  /**
   * 批量修改用户启用状态
   * @param {Object} data
   * @param {Array<number>} data.userIds - 需要操作的用户ID列表
   * @param {boolean} data.isEnabled - 目标启用状态
   * @returns {Promise}
   */
  batchUpdateUserStatus: (data) => {
    return service.put("/users/batch-status", data);
  },

  /**
   * 批量删除用户
   * @param {Object} data
   * @param {Array<number>} data.userIds - 需要删除的用户ID列表
   * @returns {Promise}
   */
  batchDeleteUsers: (data) => {
    return service.delete("/users/batch-delete", { data });
  },

  /**
   * 创建新用户（批量创建或单个取决于实际业务）
   * @param {Object} requestObj - 请求体
   * @param {Array} requestObj.users -批量注册用户信息
   * @param {string} users[].username - 用户名（唯一）
   * @param {string} users[].password - 密码
   * @param {string} users[].name - 真实姓名
   * @param {string} users[].role - 角色
   * @param {boolean} [users[].isEnabled=true] - 是否启用
   * @param {Array} users[].reviewerGroupIds - 将用户关联至评分组ID
   * @returns {Promise}
   */
  createUser: (requestObj) => {
    // console.log(requestObj)
    return service.post("/users", requestObj);
  },

  /**
   * 编辑用户信息
   * @param {number} userId - 用户ID
   * @param {Object} data - 要修改的用户信息（非全量，传需要改的字段即可）
   * @param {string} [data.name] - 真实姓名
   * @param {string} [data.role] - 角色
   * @param {boolean} [data.isEnabled] - 是否启用
   * @param {String} newPassword - 新密码
   * @returns {Promise}
   */
  editUser: (userId, data) => {
    return service.put(`/users/${userId}`, data);
  },

  /**
   * 变更用户自己的密码
   * @param {String} oldPassword 原密码
   * @param {String} newPassword 新密码
   * @return {Promise}
   */
  editPassword: (data) => {
    return service.put(`/users/me/password`, data);
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
  // getCurrentUser: () => {
  //   return service.get("/users/current");
  // },
};

// 导出默认值，支持两种导入方式：
// 1. import { userApi } from '@/api/user.js'
// 2. import userApi from '@/api/user.js'
export default userApi;
