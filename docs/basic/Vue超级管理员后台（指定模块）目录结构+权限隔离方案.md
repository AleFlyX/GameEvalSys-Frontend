# Vue超级管理员后台（指定模块）目录结构+权限隔离方案

# 一、核心目录结构（Vue3 + Vite + Pinia + Element Plus，适配指定5个模块）

> 变更注记（2026-05-28）：仓库已把 `superAdminRoutes` 等前端静态业务路由模块移除，业务路由
> 现在由后端 `/auth/routes` 提供。文档中保留的路由示例为历史或参考实现；实际项目请以后端返回
> 的菜单树与前端 `routeMap` 映射为准。

说明：目录按“功能模块+通用封装”划分，聚焦 **IP访问控制、系统监控、日志管理、控制台、API接口测试** 5个模块，兼顾可扩展性和可维护性，与普通管理员模块物理隔离，避免权限泄露。

## src/ 核心目录（重点标注指定模块）

```plain text
src/
├── api/                  # 接口请求封装（按模块划分，权限校验嵌入）
│   ├── superAdmin/       # 超级管理员专属接口（仅超级管理员可请求）
│   │   ├── dashboard.js  # 控制台接口（数据概览、统计）
│   │   ├── ipControl.js  # IP访问控制接口（白名单/黑名单增删改查）
│   │   ├── systemMonitor.js # 系统监控接口（服务器、接口、在线人数）
│   │   ├── logManage.js  # 日志管理接口（登录/操作/错误日志）
│   │   └── apiTest.js    # API接口测试接口（接口调用、参数配置）
│   ├── common/           # 公共接口（无需超级权限，如退出登录）
│   └── request.js        # 请求拦截器（权限校验核心）
├── assets/               # 静态资源（样式、图标，区分超级管理员主题）
│   ├── css/
│   │   └── super-admin.css # 超级管理员专属样式（可选，区分普通管理员）
│   └── icons/
├── components/           # 公共组件 + 超级管理员专属组件
│   ├── common/           # 全局公共组件（面包屑、标签页等）
│   └── superAdmin/       # 超级管理员专属组件（仅该模块使用）
│       ├── dashboard/    # 控制台组件（图表、数据卡片）
│       ├── ipControl/    # IP访问控制组件（白名单表格、添加弹窗等）
│       ├── systemMonitor/ # 系统监控组件（服务器状态、接口监控图表）
│       ├── logManage/    # 日志管理组件（日志表格、筛选组件）
│       └── apiTest/      # API测试组件（请求表单、响应展示、历史记录）
├── router/               # 路由配置（权限路由核心，区分超级/普通管理员）
│   ├── index.js          # 路由入口（注册所有路由，配置守卫）
│   ├── superAdminRoutes.js # 超级管理员专属路由（指定5个模块） — 历史示例（已移除，业务路由由后端提供）
│   └── commonRoutes.js   # 公共路由（登录、404等）
├── store/                # Pinia状态管理（权限、用户信息存储）
│   ├── index.js          # Pinia入口
│   ├── modules/
│   │   ├── userStore.js  # 用户信息（角色、权限标识）
│   │   └── permissionStore.js # 权限状态（路由过滤、按钮权限）
├── views/                # 页面视图（与组件对应，按模块划分）
│   ├── login/            # 登录页面（权限校验入口）
│   ├── 403/              # 无权限页面（普通管理员访问超级模块时跳转）
│   ├── 404/              # 页面不存在
│   └── superAdmin/       # 超级管理员专属页面（指定5个模块）
│       ├── Dashboard/    # 控制台页面
│       ├── IpControl/    # IP访问控制页面
│       ├── SystemMonitor/ # 系统监控页面
│       ├── LogManage/    # 日志管理页面
│       └── ApiTest/      # API接口测试页面
├── permission/           # 权限隔离核心封装
│   ├── permissionGuard.js # 路由守卫（拦截无权限访问）
│   ├── roleEnum.js       # 角色枚举（超级管理员、普通管理员）
│   └── permissionCheck.js # 权限校验工具（按钮、菜单权限）
├── utils/                # 工具函数
│   ├── format.js         # 数据格式化（日志、监控数据）
│   ├── apiTestUtil.js    # API测试工具（参数拼接、响应解析）
│   └── ipUtil.js         # IP工具（IP格式校验、地区解析）
├── App.vue               # 根组件（路由出口，区分超级/普通管理员布局）
└── main.js               # 入口文件（注册路由、Pinia、权限守卫）
```

## 关键说明

- 所有指定模块均放在 `superAdmin/` 目录下（api、components、views），与普通管理员模块完全隔离，物理层面避免权限混淆；

- 路由、接口、组件均按“超级管理员专属”划分，普通管理员无对应目录访问权限；

- 权限相关代码集中在 `permission/` 目录，便于维护和修改，降低耦合。

# 二、权限隔离实现方案（核心：超级管理员专属，普通管理员无法访问/操作）

核心原则：**角色区分 + 路由拦截 + 接口校验 + 视图隐藏 + 按钮权限**五层隔离，确保指定5个模块仅超级管理员可访问、操作，杜绝越权。

前提：用户角色分为两类（通过后端返回，前端存储）—— SUPER_ADMIN（超级管理员）、ADMIN（普通管理员），角色标识存在 Pinia 的 userStore 中。

## 1. 第一层：路由隔离（最基础，拦截无权限路由）

### 1.1 路由划分（历史示例：superAdminRoutes.js）

超级管理员专属路由单独配置，添加 `meta: { role: 'SUPER_ADMIN' }` 标识，普通管理员路由无此标识。

> 历史示例：下面为早期在前端以静态模块方式注册超级管理员路由的样例实现。自 2026-05-28 起，仓库已移除该静态模块，业务路由由后端 `/auth/routes` 提供，前端应使用 `routeMap` 进行 `componentCode` 映射并由后端下发菜单树。

```javascript
// src/router/superAdminRoutes.js （历史示例，已移除）
export const superAdminRoutes = [
  {
    path: "/super-admin",
    name: "SuperAdmin",
    component: () => import("@/views/superAdmin/SuperAdminLayout.vue"), // 超级管理员专属布局
    meta: { role: "SUPER_ADMIN" }, // 仅超级管理员可访问
    children: [
      // 控制台
      {
        path: "dashboard",
        name: "SuperDashboard",
        component: () => import("@/views/superAdmin/Dashboard/index.vue"),
        meta: { title: "控制台", role: "SUPER_ADMIN" },
      },
      // IP访问控制
      {
        path: "ip-control",
        name: "IpControl",
        component: () => import("@/views/superAdmin/IpControl/index.vue"),
        meta: { title: "IP访问控制", role: "SUPER_ADMIN" },
      },
      // 系统监控
      {
        path: "system-monitor",
        name: "SystemMonitor",
        component: () => import("@/views/superAdmin/SystemMonitor/index.vue"),
        meta: { title: "系统监控", role: "SUPER_ADMIN" },
      },
      // 日志管理
      {
        path: "log-manage",
        name: "LogManage",
        component: () => import("@/views/superAdmin/LogManage/index.vue"),
        meta: { title: "日志管理", role: "SUPER_ADMIN" },
      },
      // API接口测试
      {
        path: "api-test",
        name: "ApiTest",
        component: () => import("@/views/superAdmin/ApiTest/index.vue"),
        meta: { title: "API接口测试", role: "SUPER_ADMIN" },
      },
    ],
  },
];

// src/router/index.js 中注册
import { superAdminRoutes } from "./superAdminRoutes";
import { commonRoutes } from "./commonRoutes";

const router = createRouter({
  routes: [...commonRoutes, ...superAdminRoutes],
});
```

### 1.2 路由守卫（permissionGuard.js）

全局前置守卫，拦截所有路由，判断用户角色是否有权访问，无权限则跳转403页面。

```javascript
// src/permission/permissionGuard.js
import { useUserStore } from "@/store/modules/userStore";
import router from "@/router";

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const userRole = userStore.role; // 从Pinia获取用户角色（SUPER_ADMIN/ADMIN）
  const requiresSuperAdmin = to.meta.role === "SUPER_ADMIN"; // 判断是否需要超级权限

  // 未登录：跳转登录页
  if (!userRole) {
    next({ name: "Login" });
    return;
  }

  // 普通管理员访问超级管理员路由：跳转403
  if (requiresSuperAdmin && userRole !== "SUPER_ADMIN") {
    next({ name: "403" });
    return;
  }

  // 有权限：正常跳转
  next();
});

// 全局后置守卫（可选，处理页面标题）
router.afterEach((to) => {
  document.title = to.meta.title || "超级管理员后台";
});
```

## 2. 第二层：接口隔离（拦截无权限请求）

通过请求拦截器，给超级管理员专属接口添加权限标识，后端校验角色；同时前端拦截无权限请求，避免接口泄露。

```javascript
// src/api/request.js（请求拦截器）
import axios from "axios";
import { useUserStore } from "@/store/modules/userStore";
import router from "@/router";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});

// 请求拦截器：添加权限头 + 校验角色
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const userRole = userStore.role;
    const token = userStore.token;

    // 给所有请求添加token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 超级管理员专属接口：添加角色头，同时前端校验角色
    if (config.url?.includes("/super-admin/")) {
      if (userRole !== "SUPER_ADMIN") {
        // 前端直接拦截，不发起请求，跳转403
        router.push({ name: "403" });
        return Promise.reject(new Error("无超级管理员权限"));
      }
      // 给后端传递角色标识，后端二次校验
      config.headers["X-Role"] = userRole;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：处理后端返回的无权限提示
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 后端返回403（无权限），跳转403页面
    if (error.response?.status === 403) {
      router.push({ name: "403" });
    }
    return Promise.reject(error);
  },
);
```

补充：后端需配合——所有 /super-admin/ 前缀的接口，均校验 X-Role 头，仅允许 SUPER_ADMIN 角色访问，双重保障。

## 3. 第三层：视图隔离（隐藏无权限菜单/页面）

通过权限指令/工具函数，控制菜单、页面元素的显示/隐藏，普通管理员看不到超级管理员的菜单和页面内容。

### 3.1 菜单显示控制（左侧菜单栏）

在超级管理员专属布局的菜单栏中，通过权限校验，只渲染超级管理员可见的菜单。

```vue
// src/views/superAdmin/SuperAdminLayout.vue（菜单栏部分）
<template>
  <el-menu :default-active="activeMenu" class="super-admin-menu"&gt;
    <!-- 仅超级管理员显示菜单 -->
    <el-menu-item
      v-for="item in menuList"
      :key="item.name"
      :index="item.path"
      v-if="hasSuperPermission()"
    >
      <template #icon><el-icon><item.icon></el-icon></template>
      {{ item.title }}
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useUserStore } from '@/store/modules/userStore'
import { hasSuperPermission } from '@/permission/permissionCheck'

// 超级管理员菜单列表（与路由对应）
const menuList = [
  { name: 'SuperDashboard', path: '/super-admin/dashboard', title: '控制台', icon: 'Dashboard' },
  { name: 'IpControl', path: '/super-admin/ip-control', title: 'IP访问控制', icon: 'Lock' },
  { name: 'SystemMonitor', path: '/super-admin/system-monitor', title: '系统监控', icon: 'Monitor' },
  { name: 'LogManage', path: '/super-admin/log-manage', title: '日志管理', icon: 'Document' },
  { name: 'ApiTest', path: '/super-admin/api-test', title: 'API接口测试', icon: 'Code' }
]
</script>
```

### 3.2 权限工具函数（permissionCheck.js）

```javascript
// src/permission/permissionCheck.js
import { useUserStore } from "@/store/modules/userStore";
import { RoleEnum } from "./roleEnum";

// 校验是否为超级管理员
export const hasSuperPermission = () => {
  const userStore = useUserStore();
  return userStore.role === RoleEnum.SUPER_ADMIN;
};

// 按钮权限校验（后续扩展，如超级管理员专属按钮）
export const hasBtnPermission = (btnPermission) => {
  const userStore = useUserStore();
  if (userStore.role === RoleEnum.SUPER_ADMIN) {
    return true; // 超级管理员拥有所有按钮权限
  }
  // 普通管理员按钮权限控制（此处可扩展）
  return false;
};
```

### 3.3 全局权限指令（可选，更灵活控制元素显示）

注册全局指令，直接在页面中控制元素是否显示（如超级管理员专属按钮）。

```javascript
// src/main.js 注册全局指令
import { hasSuperPermission } from "@/permission/permissionCheck";

// 全局指令：v-super-permission（仅超级管理员可见）
app.directive("super-permission", {
  mounted(el) {
    if (!hasSuperPermission()) {
      el.style.display = "none"; // 无权限隐藏元素
    }
  },
});

// 页面中使用
// <el-button v-super-permission type="primary">超级管理员专属按钮</el-button>
```

## 4. 第四层：按钮权限隔离（细粒度控制操作）

针对指定模块的敏感操作（如删除IP白名单、清空日志、测试高危接口），添加按钮权限校验，确保只有超级管理员可操作。

示例（IP访问控制页面，删除白名单按钮）：

```vue
// src/views/superAdmin/IpControl/index.vue
<template>
  <el-table :data="ipWhiteList">
    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="danger" @click="deleteIp(scope.row.id)" v-super-permission>
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

## 5. 第五层：本地存储隔离（避免权限信息泄露）

- 用户角色、权限信息存储在 Pinia（而非 localStorage），避免本地篡改；

- 超级管理员专属的敏感数据（如API测试历史、IP白名单），仅在超级管理员登录时加载，退出登录后清空，普通管理员无法获取；

- 禁止普通管理员访问超级管理员的本地存储key（通过工具函数拦截）。

# 三、权限隔离补充说明（落地注意事项）

1. 后端校验是核心：前端所有权限控制均为“辅助拦截”，最终权限校验必须在后端完成（如接口校验角色、数据库查询过滤），防止前端篡改角色绕过限制；

2. 路由隐藏：普通管理员的路由表中，不注册超级管理员的路由，即使手动输入路由地址，也会被路由守卫拦截跳转403；

3. 样式隔离：超级管理员页面可使用专属样式，与普通管理员页面区分，同时避免样式污染；

4. 测试验证：需分别用超级管理员、普通管理员账号测试，确保普通管理员无法访问指定5个模块的任何页面、接口、按钮。

# 四、核心优势（贴合Vue项目落地）

- 目录清晰：指定5个模块集中管理，后续扩展其他超级管理员功能时，可直接在 superAdmin 目录下新增，不影响其他代码；

- 权限严谨：五层隔离，从路由到按钮，全方位杜绝越权，符合企业级后台安全要求；

- 可维护性高：权限逻辑集中封装，修改权限规则时，仅需修改 permission 目录下的代码，无需改动业务模块；

- 适配Vue生态：兼容 Element Plus/Ant Design Vue，路由、Pinia 用法贴合Vue3最佳实践，可直接复制落地。
  > （注：文档部分内容可能由 AI 生成）
