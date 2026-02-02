<template>
  <div class="sidebar">
    <span class="title">项目评分平台</span>
    <ul class="nav-items">
      <!-- 普通菜单 -->
      <li class="menu-item" v-for="item in norm" :key="item.path" @click="gotoRoute(item.path)"
        :class="{ active: isActive(item.path) && (!showSubMenu) }">
        {{ item.name }}
      </li>
      <!-- 折叠菜单组 -->
      <li class="fold-menu-group">
        <!-- 折叠菜单头部 -->
        <div class="fold-menu-header" @click="showSubMenu = !showSubMenu" :class="{ active: showSubMenu }">
          admin
          <span class="arrow" :class="{ active: showSubMenu }">^</span>
        </div>
        <!-- 折叠菜单子项 -->
        <ul class="fold-submenu">
          <li class="menu-item sub-item" v-for="item in admin" :key="item.path" @click="gotoRoute(item.path)"
            :class="{ active: isActive(item.path), show: showSubMenu }">
            {{ item.name }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { norm } from "@/router/modules/normalRoutes";
import { admin } from "@/router/modules/adminRoutes";

const router = useRouter();
const route = useRoute(); // 当前路由实例
const showSubMenu = ref(false); // 折叠菜单展开状态

// 跳转路由方法
const gotoRoute = (path) => {
  router.push(path);
};

// 路由匹配方法
const isActive = (path) => {
  // 精准匹配路由路径，避免/拼接的潜在问题（如path为home时，/home和$route.path直接对比）
  return route.path === `/${path}`;
};

// 监听路由变化：跳转到admin子菜单时，自动展开折叠面板
watch(
  () => route.path,
  (newPath) => {
    // 判断当前路由是否是admin子菜单中的项
    const isAdminPath = admin.some(item => newPath === `/${item.path}`);
    if (isAdminPath) {
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

/* 所有菜单项基础样式（普通+子项共用，减少冗余） */
.menu-item {
  position: relative;
  line-height: 48px;
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 7px solid transparent;
  user-select: none;
}

/* 鼠标悬浮样式（统一） */
.menu-item:hover {
  background-color: #34495e;
  padding-left: 25px;
}

/* 选中态样式（统一） */
.menu-item.active {
  background-color: #1abc9c;
  color: #fff;
  border-left-color: #0f997d;
  padding-left: 25px;
}

/* 折叠菜单组 - 包裹头部+子项 */
.fold-menu-group {
  list-style: none;
}

/* 折叠菜单头部 */
.fold-menu-header {
  line-height: 48px;
  font-size: 16px;
  font-weight: 700;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 7px solid transparent;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 折叠头部悬浮/展开态 */
.fold-menu-header:hover,
.fold-menu-header.active {
  background-color: #34495e;
  padding-left: 25px;
}

/* 折叠头部展开选中态（和普通菜单统一视觉） */
.fold-menu-header.active {
  background-color: #1abc9c;
  border-left-color: #0f997d;
  color: #fff;
}

/* 折叠箭头样式 */
.arrow {
  font-size: 14px;

  transition: all 0.2s ease;
}

.arrow.active {
  transform: rotate(0.5turn);
}

/* 折叠子菜单容器 */
.fold-submenu {
  list-style: none;
  background-color: #1a2533;
  /* 子菜单背景加深，区分层级 */
  overflow: hidden;
  /* 隐藏溢出，配合子项动画 */
}

/* 折叠子项基础样式 */
.menu-item.sub-item {
  font-weight: 400;
  border-left: 7px solid transparent;
  /* 子项缩进，体现层级 */
  padding-left: 35px;
}

/* 子项悬浮/选中态修正（取消重复缩进，保持视觉统一） */
.menu-item.sub-item:hover,
.menu-item.sub-item.active {
  padding-left: 40px;
  background-color: #1abc9c79;
  border-left-color: #0f997d;
}

/* 子项展开/收起动画 */
.menu-item.sub-item {
  /* visibility: hidden; */
  line-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;
}

/* 展开时的样式 */
.menu-item.sub-item.show {
  /* visibility: visible; */
  line-height: 48px;
  opacity: 1;
  transform: translateY(0);
}
</style>
