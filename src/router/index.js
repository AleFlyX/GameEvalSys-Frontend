import { createRouter, createWebHistory } from "vue-router";

import { pub } from "@/router/modules/publicRoutes";
import { useUserStore } from "@/stores/modules/userStore";
import { ElMessage } from "element-plus";

const routes = [...pub];
console.log("_RoutesLoaded_", routes);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    // console.log("当前页有标题");
    document.title = `${to.meta.title} -项目评分系统`;
  }
  const userStore = useUserStore();
  if (to.meta.requireAuth) {
    if (userStore.isLogin) {
      //已登录
      if (to.meta.roles && to.meta.roles.length) {
        console.log(to.path + "有限制访问角色");
        //检查目标页面是否有权限限制
        if (to.meta.roles.includes(userStore.userInfo.role)) {
          next();
        } else {
          console.log(to.path + "当前角色无权" + userStore.userInfo.role);
          ElMessage.error("无权访问该页面");
          next("/403");
        }
      } else {
        //无限制 可以直接访问
        next();
      }
      // next("/login");
    } else {
      //未登录
      ElMessage.warning("请先登录");
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
export default router;
