import axios from "axios";
import { useMessage } from "@/composables/useMessage";
import { showMsgBox } from "./ConfirmBox";

const message = useMessage();

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1", // 基础路径（从环境变量读取）
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json;charset=utf-8", // 默认请求格式
  },
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

const ACCESS_TOKEN_KEY = "accessToken";
const LEGACY_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const SID_KEY = "sid";
const EXPIRE_TIME_KEY = "expireTime";

let refreshPromise = null;
let reloginPromptVisible = false;

// 路由实例（用于401跳转）
let router = null;
export function setRouter(r) {
  router = r;
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || "";
}

function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SID_KEY);
  localStorage.removeItem(EXPIRE_TIME_KEY);
  localStorage.removeItem("userInfo");
}

function jumpToLogin() {
  if (router && typeof router.push === "function") {
    router.push("/login");
    return;
  }
  window.location.href = "/login";
}

function promptRelogin(messageText = "登录状态已过期，请重新登录") {
  if (reloginPromptVisible) return;
  reloginPromptVisible = true;
  showMsgBox("提示", messageText, {
    confirmButtonText: "去登录",
    showCancelButton: false,
    showClose: false,
    showDefaultClose: false,
    closeOnClickModal: false,
    alowDefaultClose: false,
    type: "warning",
  }).then(() => {
    jumpToLogin();
  }).finally(() => {
    reloginPromptVisible = false;
  });
}

function shouldSkipRefresh(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/refresh");
}

async function doRefreshToken() {
  const sid = localStorage.getItem(SID_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!sid || !refreshToken) {
    throw new Error("缺少刷新凭证");
  }
  const response = await refreshClient.post("/auth/refresh", { sid, refreshToken });
  const res = response.data;
  if (res?.code !== 200 || !res?.data?.token || !res?.data?.refreshToken) {
    throw new Error(res?.message || "刷新登录失败");
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, res.data.token);
  localStorage.setItem(LEGACY_TOKEN_KEY, res.data.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
  if (res.data.sid) localStorage.setItem(SID_KEY, res.data.sid);
  if (res.data.expireTime) localStorage.setItem(EXPIRE_TIME_KEY, res.data.expireTime);
  return res.data.token;
}

// -------------------------- 请求拦截器：添加token、处理请求前逻辑 --------------------------
service.interceptors.request.use(
  async (config) => {
    // 1. 从localStorage获取token（登录后存储的）
    const token = getAccessToken();
    // 2. 自动添加Authorization请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 3. GET请求防止缓存
    if (config.method === "get" && config.params) {
      config.params = {
        ...config.params,
        _t: config.params?._t || Date.now(),
      };
      // config.params._t = new Date().getTime()
    }
    if (import.meta.env.VITE_DELAY_REQUEST === 1) await new Promise(resolve => setTimeout(resolve, 5000));
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
    // 处理文件流（blob）响应 - 直接返回
    if (response.data instanceof Blob) {
      return response.data;
    }

    const res = response.data;
    // 1. 接口返回成功（code=200）
    if (res.code === 200) {
      return res; // 直接返回数据，业务层无需再取data
    } else {
      // 2. 接口返回业务错误（如参数错误、权限不足等）
      message.error(res.message || "请求失败");
      return Promise.reject(res);
    }
  },
  async (error) => {
    // 3. HTTP状态码错误处理
    console.error("响应拦截器错误：", error);
    const responseData = error.response?.data;
    const backendMessage = responseData?.message;
    if (backendMessage) {
      error.message = backendMessage;
    }
    const status = error.response?.status;
    switch (status) {
      case 401:
        {
          const originalRequest = error.config || {};
          const requestUrl = originalRequest.url || "";
          const canTryRefresh = !originalRequest._retry && !shouldSkipRefresh(requestUrl);
          if (canTryRefresh) {
            try {
              originalRequest._retry = true;
              if (!refreshPromise) {
                refreshPromise = doRefreshToken().finally(() => {
                  refreshPromise = null;
                });
              }
              const newToken = await refreshPromise;
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return service(originalRequest);
            } catch (refreshError) {
              clearAuthStorage();
              promptRelogin("登录已失效，请重新登录");
              return Promise.reject(refreshError);
            }
          }
          clearAuthStorage();
          promptRelogin("登录状态已过期，请重新登录");
          break;
        }
      case 403:
        message.error(backendMessage || "没有权限执行该操作");
        break;
      case 404:
        message.error(backendMessage || "请求的资源不存在");
        break;
      case 400:
        message.error(backendMessage || "参数错误");
        break;
      case 500:
        message.error(backendMessage || "服务器内部错误，请稍后重试");
        break;
      default:
        message.error(backendMessage || error.message || "请求出错，请稍后重试");
    }
    return Promise.reject(error);
  },
);


export default service;
