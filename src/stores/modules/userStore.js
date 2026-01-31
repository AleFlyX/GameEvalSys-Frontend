import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userApi } from "@/api/user.js";

export const useUserStore = defineStore("userStore", () => {
  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref(JSON.parse(localStorage.getItem("userInfo")) || {});
  const isLogin = ref(!!localStorage.getItem("token"));

  const userRole = computed(() => userInfo.value.role || "");
  const isAdmin = computed(() => ["admin", "super_admin"].includes(userInfo.value.role));
  const isScorer = computed(() => userInfo.value.role === "scorer");

  /**
   * 清除登陆状态
   */
  function clearUserStore() {
    token.value = "";
    userInfo.value = {};
    isLogin.value = false;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  /**
   * 登录
   * @param {object} loginForm -登录表单
   * @returns {Promise}
   */
  async function login(loginForm) {
    try {
      const data = await userApi.login(loginForm);
      token.value = data.token;
      userInfo.value = data.userInfo;
      localStorage.setItem("token", token.value);
      localStorage.setItem("userInfo", JSON.parse(userInfo.value));
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
      //无论是否成功，都执行以下操作
      clearUserStore();
    }
  }

  return {
    token,
    userInfo,
    userRole,
    isLogin,
    isScorer,
    isAdmin,
    login,
    logout,
  };
});
