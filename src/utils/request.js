import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1", // 基础路径（从环境变量读取）
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json;charset=utf-8", // 默认请求格式
  },
});

// 路由实例（用于401跳转）
const router = useRouter();

// -------------------------- 请求拦截器：添加token、处理请求前逻辑 --------------------------
service.interceptors.request.use(
  (config) => {
    // 1. 从localStorage获取token（登录后存储的）
    const token = localStorage.getItem("token");
    // 2. 自动添加Authorization请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 3. GET请求防止缓存（可选）
    if (config.method === "get" && config.params) {
      config.params = {
        ...config.params,
        _t: config.params?._t || Date.now(),
      };
      // config.params._t = new Date().getTime()
    }
    return config;
  },
  (error) => {
    // 请求错误前置处理
    console.error("请求拦截器错误：", error);
    return Promise.reject(error);
  },
);

// -------------------------- 响应拦截器：统一处理返回结果、错误码 --------------------------
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 1. 接口返回成功（code=200）
    if (res.code === 200) {
      return res; // 直接返回数据，业务层无需再取data
    } else {
      // 2. 接口返回业务错误（如参数错误、权限不足等）
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(res);
    }
  },
  (error) => {
    // 3. HTTP状态码错误处理
    console.error("响应拦截器错误：", error);
    const status = error.response?.status;
    switch (status) {
      case 401:
        // token过期/未登录：清除token并跳转登录页
        localStorage.removeItem("token");
        ElMessageBox.confirm("登录状态已过期，请重新登录", "提示", {
          confirmButtonText: "去登录",
          // cancelButtonText: '取消',
          type: "warning",
        }).then(() => {
          router.push("/login"); // 跳转到登录页（根据你的路由配置调整）
        });
        break;
      case 403:
        ElMessage.error("没有权限执行该操作");
        break;
      case 404:
        ElMessage.error("请求的资源不存在");
        break;
      case 500:
        ElMessage.error("服务器内部错误，请稍后重试");
        break;
      default:
        ElMessage.error(error.message || "请求出错，请稍后重试");
    }
    return Promise.reject(error);
  },
);

// -------------------------- 导出常用请求方法（简化业务层调用） --------------------------
// const request = {
//   get(url, params = {}) {
//     return service.get(url, { params })
//   },
//   post(url, data = {}) {
//     return service.post(url, data)
//   },
//   put(url, data = {}) {
//     return service.put(url, data)
//   },
//   delete(url, params = {}) {
//     return service.delete(url, { params })
//   },
// }

// export { request }
// export default request
export default service;
