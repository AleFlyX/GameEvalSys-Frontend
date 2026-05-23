import { createRouter, createWebHistory } from "vue-router";

import { pub } from "@/router/modules/publicRoutes";
import { useUserStore } from "@/stores/modules/userStore";
import { useMessage } from "@/composables/useMessage";
import { bootstrapRoutesFromStorage, fetchAndInjectBackendRoutes } from "@/router/permission";

const message = useMessage();
const routes = [...pub];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Try to fetch routes from backend first; if network fails, fall back to persisted local routes.
fetchAndInjectBackendRoutes(router).catch(() => {
  console.log('ROUTE FETCh ERR')
  // ignore errors and fallback to persisted routes
  bootstrapRoutesFromStorage(router);
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    // console.log("当前页有标题");
    document.title = `${to.meta.title} -项目评分系统`;
  }
  const userStore = useUserStore();
  // if logged in but dynamic routes not injected yet, prefer backend routes and fall back to local storage
  if (userStore.isLogin && !userStore.routesReady) {
    try {
      const backendInjected = await fetchAndInjectBackendRoutes(router);
      if (!backendInjected) {
        bootstrapRoutesFromStorage(router);
      }
      userStore.setRoutesReady(true);
      // re-enter by path so vue-router re-matches against newly added routes
      return next({ path: to.fullPath, query: to.query, hash: to.hash, replace: true });
    } catch (err) {
      // continue to normal flow on error
      console.error("inject dynamic routes failed", err);
    }
  }
  if (to.meta.requireAuth) {
    if (userStore.isLogin) {
      //已登录
      if (to.meta.roles && to.meta.roles.length) {
        //检查目标页面是否有权限限制
        if (to.meta.roles.includes(userStore.userInfo.role)) {
          next();
        } else {
          message.error("无权访问该页面");
          next("/403");
        }
      } else {
        //无限制 可以直接访问
        next();
      }
      // next("/login");
    } else {
      //未登录
      message.warning("请先登录");
      next(`/login?redirect=${to.fullPath}`);
    }
  } else {
    //若无需登录,查看当前登录状态
    if (userStore.isLogin && to.path === "/login") {
      next("/home");
    } else {
      next();
    }
  }
});
// // 全局后置守卫 – 每次路由切换完成后执行
// router.afterEach(() => {
//   window.scrollTo({
//     top: 0,
//     behavior: 'smooth'   // 平滑滚动
//   })
// })
export default router;
