import axios from 'axios';
/**
 * 全局 request 拦截器会把 404/500 直接弹出来，
 * 监控页如果先接了“未实现接口”会影响体验。
 * 所以我把监控 API 改成独立实例，保留以后接后端的入口，
 * 但不会把页面初始化搞得很吵。
 */
const monitorService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

monitorService.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const monitorBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

function buildMonitorUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${monitorBaseUrl}${normalizedPath}`;
}

/**
 * 监控面板 API
 * 目前前端按文档中的聚合接口设计，后端就绪后可直接接入。
 */
export const monitorApi = {
  getDashboard: () => {
    return monitorService.get('/admin/monitor/dashboard');
  },

  getOverview: () => {
    return monitorService.get('/admin/monitor/overview');
  },

  getHealth: () => {
    return monitorService.get('/admin/monitor/health');
  },

  getDataSource: () => {
    return monitorService.get('/admin/monitor/datasource');
  },

  getRedis: () => {
    return monitorService.get('/admin/monitor/redis');
  },

  getJvm: () => {
    return monitorService.get('/admin/monitor/jvm');
  },

  getOs: () => {
    return monitorService.get('/admin/monitor/os');
  },

  getConfig: () => {
    return monitorService.get('/admin/monitor/config');
  },

  getLogs: (params = {}) => {
    return monitorService.get('/admin/monitor/logs', { params });
  },

  getMetrics: (params = {}) => {
    return monitorService.get('/admin/monitor/metrics', { params });
  },

  getStreamUrl: () => {
    const url = new URL(buildMonitorUrl('/admin/monitor/stream'), window.location.origin);
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
    if (token) {
      url.searchParams.set('accessToken', token);
    }
    return url.toString();
  },
};

export default monitorApi;
