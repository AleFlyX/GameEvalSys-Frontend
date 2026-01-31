<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapse': collapse }">
      <div class="sidebar-logo">课题打分系统</div>
      <el-menu default-active="$route.name" class="sidebar-menu" :collapse="collapse" router unique-opened>
        <!-- 遍历菜单列表，按角色渲染 -->
        <el-menu-item v-for="menu in menuList" :key="menu.name" :index="menu.name" :icon="menu.icon">
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
        <!-- <el-menu-item>aa</el-menu-item> -->
      </el-menu>
    </div>
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 头部 -->
      <div class="header">
        <div class="header-left">
          <el-icon @click="collapse = !collapse" class="collapse-icon">
            <Expand v-if="collapse" />
            <!-- <Collapse v-else /> -->
            <CircleClose v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <span class="user-info">
            欢迎，{{ userStore.userInfo.name || userStore.userInfo.username }}
            ({{ formatRole(userStore.userRole) }})
          </span>
          <el-dropdown trigger="click">
            <el-icon class="user-icon">
              <UserFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!-- 页面内容容器 -->
      <div class="page-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { Expand, CircleClose, UserFilled } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/modules/userStore.js';
import { formatRole } from '@/utils/format.js';

const router = useRouter();
const userStore = useUserStore();
// 侧边栏折叠状态
const collapse = ref(false);

// 1. 定义所有菜单（按权限规则配置，与路由meta一致）
const allMenus = [
  { name: 'home', title: '首页', icon: 'House', roles: ['super_admin', 'admin', 'scorer', 'normal'] },
  { name: 'scoringList', title: '打分项目', icon: 'List', roles: ['super_admin', 'admin', 'scorer'] },
  { name: 'userList', title: '用户管理', icon: 'User', roles: ['super_admin', 'admin'] },
  { name: 'projectList', title: '项目管理', icon: 'FolderOpened', roles: ['super_admin', 'admin'] }
];

// 2. 按当前用户角色过滤菜单（核心：不同角色看到不同菜单）
const menuList = computed(() => {
  const currentRole = userStore.userRole;
  return allMenus.filter(menu => menu.roles.includes(currentRole));
});

// 3. 退出登录
const handleLogout = async () => {
  await userStore.logout();
  ElMessage.success('退出成功');
  router.push('/login');
};
</script>

<style scoped>
/* 主布局样式 - 弹性布局，侧边栏固定，主内容自适应 */
.main-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;
  background-color: #2e3b4e;
  color: #fff;
  transition: width 0.3s;
}

.sidebar-collapse {
  width: 64px;
}

.sidebar-logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #384459;
}

.sidebar-menu {
  height: calc(100% - 60px);
  border-right: none;
  background-color: #2e3b4e;
}

:deep(.el-menu) {
  background-color: #2e3b4e;
  color: #fff;
}

:deep(.el-menu-item) {
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: #fff;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

/* 头部样式 */
.header {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #666;
  font-size: 14px;
}

.user-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

/* 页面内容容器 */
.page-container {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  overflow: auto;
}
</style>
