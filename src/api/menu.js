import service from '@/utils/request.js';

/**
 * 菜单管理 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
 *
 * SQL 相关约定：
 * - POST /admin/menus 和 PUT /admin/menus/{id} 会返回本次保存对应的标准 SQL
 * - GET /admin/menus/sql 用于查询当前全部菜单 SQL
 *
 * 详细说明见 docs/dev/menu-sql-api.md
 */
export const menuApi = {
  /**
   * 获取菜单树
   * @returns {Promise}
   */
  getMenuTree: () => {
    return service.get('/admin/menus');
  },

  /**
   * 获取菜单详情
   * @param {number|string} menuId
   * @returns {Promise}
   */
  getMenuDetail: (menuId) => {
    return service.get(`/admin/menus/${menuId}`);
  },

  /**
   * 创建菜单
   * @param {Object} data
   * @returns {Promise<{data?: {sql?: string, fullSql?: string}}>}
   */
  createMenu: (data) => {
    return service.post('/admin/menus', data);
  },

  /**
   * 更新菜单
   * @param {number|string} menuId
   * @param {Object} data
   * @returns {Promise<{data?: {sql?: string, fullSql?: string}}>}
   */
  updateMenu: (menuId, data) => {
    return service.put(`/admin/menus/${menuId}`, data);
  },

  /**
   * 查询全部菜单 SQL
   * @returns {Promise<{data?: {menuCount?: number, generatedAt?: string, sql?: string, fullSql?: string}}>}
   */
  getMenuSql: () => {
    return service.get('/admin/menus/sql');
  },

  /**
   * 删除菜单
   * @param {number|string} menuId
   * @returns {Promise}
   */
  deleteMenu: (menuId) => {
    return service.delete(`/admin/menus/${menuId}`);
  },
};

export default menuApi;
