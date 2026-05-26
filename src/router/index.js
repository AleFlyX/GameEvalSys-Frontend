import { createRouter, createWebHistory } from "vue-router";

import { pub } from "@/router/modules/publicRoutes";
import { useMessage } from "@/composables/useMessage";
import { bootstrapRoutesFromStorage, fetchAndInjectBackendRoutes } from "@/router/permission";
import { routesReady, setDynamicRoutesReady } from "@/domain/dynamicRouteState";
import { useUserStore } from "@/stores/modules/userStore";

// 易于测试与维护：将动态路由注入、权限检查、标题设置等逻辑拆成小函数
const message = useMessage();
const routes = [...pub];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/**
 * 初始化动态路由：根据运行时配置决定先使用后端路由还是直接从本地持久化路由恢复
 * VITE_USE_LOCAL_ROUTE === 'false' 时优先尝试从后端拉取动态路由，失败回退到本地存储
 */
export function initDynamicRoutesAtStartup() {
  // If there's a token, prefer fetching backend dynamic routes so protected pages match correctly
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  if (token) {
    return fetchAndInjectBackendRoutes(router).then((injected) => {
      if (!injected) {
        // backend didn't return routes, try to restore persisted role routes
        bootstrapRoutesFromStorage(router);
      }
      try {
        // mark routes ready so consumers react
        setDynamicRoutesReady(true);
      } catch (e) {
        // ignore
      }
      return injected;
    }).catch((err) => {
      console.log("ROUTE FETCH ERR", err);
      try {
        bootstrapRoutesFromStorage(router);
      } catch (e) {
        // ignore
      }
      try { setDynamicRoutesReady(true); } catch (e) { }
      return false;
    });
  }

  // No token: fall back to local route usage if explicitly enabled, otherwise resolve quickly
  if (import.meta.env.VITE_USE_LOCAL_ROUTE === 'true') {
    try {
      bootstrapRoutesFromStorage(router);
    } catch (e) {
      // ignore
    }
  }
  try { setDynamicRoutesReady(true); } catch (e) { }
  return Promise.resolve(true);
}

/**
 * 将页面标题设置为路由元信息中的 title（如果存在）并添加项目后缀
 */
function setDocumentTitle(to) {
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} -项目评分系统`;
  }
}

/**
 * 确保已注入动态路由：
 * - 若用户已登录且 routesReady 为 false，则优先从后端注入动态路由
 * - 若后端注入失败或返回 false，则回退到本地持久化路由
 * 返回值：当完成注入并需要重新导航时返回 true（调用处会重入路由），否则返回 false
 */
function isNotFoundMatch(to) {
  if (!to) return false;
  if (!to.matched || to.matched.length === 0) return true;
  return to.matched.some((record) => record?.name === "notFound");
}

async function ensureDynamicRoutesInjectedIfNeeded(router, userStore, to) {
  if (!userStore.isLogin || routesReady.value) return false;

  try {
    await initDynamicRoutesAtStartup();
  } catch (err) {
    console.error("inject dynamic routes failed", err);
  }

  return isNotFoundMatch(to);
}

/**
 * 权限与认证检查：根据路由元信息的 requireAuth 与 roles 进行处理
 */
function handleAuthAndPermission(to, userStore) {
  if (to.meta && to.meta.requireAuth) {
    // 需要登录
    if (userStore.isLogin) {
      // 已登录，若目标路由有角色限制则校验
      if (to.meta.roles && to.meta.roles.length) {
        if (to.meta.roles.includes(userStore.userInfo.role)) {
          return { allow: true };
        }
        message.error("无权访问该页面");
        return { allow: false, redirect: "/403" };
      }
      // 无角色限制，允许访问
      return { allow: true };
    }
    // 未登录，跳转到登录并携带重定向地址
    message.warning("请先登录");
    return { allow: false, redirect: `/login?redirect=${to.fullPath}` };
  }

  // 不需要登录的路由：若已登录且目标是 /login，则重定向到 /home
  if (userStore.isLogin && to.path === "/login") {
    return { allow: false, redirect: "/home" };
  }

  return { allow: true };
}

// 全局前置守卫：集中处理标题、动态路由注入、认证与权限
router.beforeEach(async (to, from, next) => {
  setDocumentTitle(to);
  const userStore = useUserStore();

  // 需要动态路由且当前落在 404 上，则先注入后重入以触发正确匹配
  const needReenter = await ensureDynamicRoutesInjectedIfNeeded(router, userStore, to);
  if (needReenter) {
    const target = to.redirectedFrom?.fullPath || to.fullPath;
    return next({ path: target, query: to.query, hash: to.hash, replace: true });
  }

  // 处理认证与权限
  const authResult = handleAuthAndPermission(to, userStore);
  if (authResult.allow) {
    return next();
  }
  return next(authResult.redirect);
});

export default router;
