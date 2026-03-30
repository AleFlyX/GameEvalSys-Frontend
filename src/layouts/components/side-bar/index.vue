<template>
  <div class="sidebar">
    <span class="title">项目评分平台</span>
    <!-- <MyBtn v-if="userStore.isAdmin" type="primary" style="align-self: center;margin: 5px;width: 50%;"
      @click="handleAgentShow">使用Agent
    </MyBtn> -->
    <ul class="nav-items">
      <!-- 普通菜单 -->
      <div v-for="item in norm" :key="item.path" @click="gotoRoute(item.path)">
        <MenuItem v-if="!item.meta.hidden" :active="(isActive(item.path) && (!showSubMenu))">
        {{ item.name }}
        </MenuItem>
      </div>

      <!-- 折叠菜单组 -->
      <MenuFolder v-if="userStore.isAdmin" label="管理面板" :show-sub-menu="showSubMenu"
        @update:showSubMenu="showSubMenu = $event">

        <div v-for="item in admin" :key="item.path">

          <MenuItem v-if="!item.meta.hidden" @click="gotoRoute(item.path)" type="subMenu" :active="isActive(item.path)"
            :show="showSubMenu">
          {{ item.name }}
          </MenuItem>

        </div>

      </MenuFolder>
      <MenuItem :active="showAgent" v-if="userStore.isAdmin" @click="handleAgentShow">使用PageAgent</MenuItem>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { norm } from "@/router/modules/normalRoutes";
import { admin } from "@/router/modules/adminRoutes";
import { useUserStore } from "@/stores/modules/userStore";
import MenuItem from "./components/menuItem.vue";
import MenuFolder from "./components/menuFolder.vue";

const router = useRouter();
const route = useRoute(); // 当前路由实例
const showSubMenu = ref(false); // 折叠菜单展开状态
const userStore = useUserStore();

const emits = defineEmits(['showAgent']);
const showAgent = ref(false);
const handleAgentShow = () => {
  showAgent.value = !showAgent.value;
  emits('showAgent', showAgent.value)
}

// 跳转路由方法
const gotoRoute = (path) => {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  router.push(path);//跳转绝对路径
};

// 路由匹配方法
const isActive = (path) => {
  // 精准匹配路由路径，避免/拼接的潜在问题（如path为home时，/home和$route.path直接对比）
  return route.path === `/${path}`
};

// 监听路由变化：跳转到admin子菜单时，自动展开折叠面板
const isAdminPath = ref(false)
watch(
  () => route.path,
  (newPath) => {
    // 判断当前路由是否是admin子菜单中的项
    isAdminPath.value = admin.some(item => newPath === `/${item.path}`);
    if (isAdminPath.value) {
      showSubMenu.value = true; // 自动展开
    }
    else {
      showSubMenu.value = false;
    }
  },
  { immediate: true } // 初始化时立即执行一次，匹配初始路由
);
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background-color: #2c3e50;
  color: #fff;
  height: 100%;
  width: 220px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.title {
  padding: 0 10px;
  text-align: center;
  line-height: 60px;
  font-size: 18px;
  font-weight: 600;
  background-color: #1a2533;
  border-bottom: 1px solid #34495e;
}

.nav-items {
  flex: 1;
  padding: 10px 0;
  list-style: none;
  /* 统一ul无序列表样式 */
}
</style>
