import service from '@/utils/request.js';

/**
 * 菜单管理 API 集合
 * 所有接口路径均基于 /api/v1 基础路径
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
   * @returns {Promise}
   */
  createMenu: (data) => {
    return service.post('/admin/menus', data);
  },

  /**
   * 更新菜单
   * @param {number|string} menuId
   * @param {Object} data
   * @returns {Promise}
   */
  updateMenu: (menuId, data) => {
    return service.put(`/admin/menus/${menuId}`, data);
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
