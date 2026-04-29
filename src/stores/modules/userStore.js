import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userApi } from "@/api/user.js";

export const useUserStore = defineStore("userStore", () => {
  const token = ref(localStorage.getItem("accessToken") || localStorage.getItem("token") || "");
  const refreshToken = ref(localStorage.getItem("refreshToken") || "");
  const sid = ref(localStorage.getItem("sid") || "");
  const expireTime = ref(localStorage.getItem("expireTime") || "");
  const userInfo = ref(
    JSON.parse(localStorage.getItem("userInfo")) ||
    {
      // id: 1, //debug
      // username: "admin",
      // role: "super_admin",
      // name: "超级管理员",
    },
  );
  const isLogin = computed(() => !!token.value);

  const userRole = computed(() => userInfo.value.role || "");
  const isAdmin = computed(() => ["admin", "super_admin"].includes(userInfo.value.role));
  const isSuperAdmin = computed(() => userInfo.value.role === "super_admin");
  const isScorer = computed(() => userInfo.value.role === "scorer");

  /**
   * 清除登陆状态
   */
  function clearUserStore() {
    token.value = "";
    refreshToken.value = "";
    sid.value = "";
    expireTime.value = "";
    userInfo.value = {};
    // 兼容旧 key 和新 key
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sid");
    localStorage.removeItem("expireTime");
    localStorage.removeItem("userInfo");
  }

  /**
   * 登录
   * @param {object} loginForm -登录表单
   * @returns {Promise}
   */
  async function login(loginForm) {
    try {
      const response = await userApi.login(loginForm);
      const data = response.data;
      token.value = data.token;
      refreshToken.value = data.refreshToken || "";
      sid.value = data.sid || "";
      expireTime.value = data.expireTime || "";
      userInfo.value = data.userInfo;
      // 兼容旧逻辑和新 JWT 逻辑
      localStorage.setItem("accessToken", token.value);
      localStorage.setItem("token", token.value);
      localStorage.setItem("refreshToken", refreshToken.value);
      localStorage.setItem("sid", sid.value);
      localStorage.setItem("expireTime", expireTime.value);
      localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 登出
   * @returns {Promise}
   */
  async function logout() {
    try {
      await userApi.logout();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    } finally {
      window.location.href = "/home";
      //无论是否成功，都执行以下操作
      clearUserStore();
    }
  }

  return {
    token,
    refreshToken,
    sid,
    expireTime,
    userInfo,
    userRole,
    isLogin,
    isScorer,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
  };
});
