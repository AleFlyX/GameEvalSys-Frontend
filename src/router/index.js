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
function initDynamicRoutesAtStartup() {
  if (import.meta.env.VITE_USE_LOCAL_ROUTE == "false") {
    // 先尝试从后端获取并注入；若失败则回退到本地持久化路由
    fetchAndInjectBackendRoutes(router).catch(() => {
      console.log("ROUTE FETCh ERR");
      bootstrapRoutesFromStorage(router);
    });
  } else {
    // 强制使用本地持久化路由（开发/调试场景）
    bootstrapRoutesFromStorage(router);
  }
}

initDynamicRoutesAtStartup();

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
async function ensureDynamicRoutesInjectedIfNeeded(router, userStore, to) {
  if (userStore.isLogin && !routesReady.value) {
    try {
      const backendInjected = await fetchAndInjectBackendRoutes(router);
      if (!backendInjected) {
        // 后端未返回动态路由，使用本地持久化路由作为备选
        bootstrapRoutesFromStorage(router);
      }
      setDynamicRoutesReady(true);
      // 通知调用者需要重新进入当前路径以触发路由匹配新注入的路由
      return true;
    } catch (err) {
      // 注入失败则继续路由流程（不阻塞用户）
      console.error("inject dynamic routes failed", err);
      // 如果注入失败但本地有缓存，也尝试回退到本地（保证最小功能）
      try {
        bootstrapRoutesFromStorage(router);
      } catch (e) {
        // 忽略回退错误
      }
      setDynamicRoutesReady(true);
      return true;
    }
  }
  return false;
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

  // 如果需要从后端拉取并注入动态路由，优先处理并在注入后重新进入当前路由以重新匹配
  const needReenter = await ensureDynamicRoutesInjectedIfNeeded(router, userStore, to);
  if (needReenter) {
    return next({ path: to.fullPath, query: to.query, hash: to.hash, replace: true });
  }

  // 处理认证与权限
  const authResult = handleAuthAndPermission(to, userStore);
  if (authResult.allow) {
    return next();
  }
  return next(authResult.redirect);
});

export default router;
