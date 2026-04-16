# UserSelectionTable 组件使用指南

## 📌 概述

`UserSelectionTable` 是一个通用的用户选择表格组件，从评审团用户选择需求中抽取而来，支持在任何需要用户多选的场景中复用。

## 🎯 核心特性

- ✅ **表格展示** - 清晰展示所有可用用户信息
- ✅ **多选操作** - 支持 Checkbox 单选、全选、反选、清空
- ✅ **搜索筛选** - 支持关键词搜索、按角色筛选
- ✅ **分页管理** - 内置分页逻辑，支持自定义每页条数
- ✅ **状态同步** - 双向绑定选中的用户ID列表
- ✅ **灵活配置** - 支持配置允许的角色、是否显示已禁用用户

## 📦 文件位置

```
src/
├── components/business/user/
│   └── UserSelectionTable.vue          # 核心组件
└── pages/admin/reviewer-group/
    ├── components/
    │   └── ReviewerGroupForm.vue       # 使用示例
    └── composables/
        └── useUserSelection.js         # 辅助 Composable（可选）
```

## 🔧 基础用法

### 在组件中使用

```vue
<template>
  <div>
    <UserSelectionTable
      v-model:selectedIds="selectedUserIds"
      :allowed-roles="['scorer', 'admin', 'super_admin']"
      :show-disabled-users="false"
      @update:selectedIds="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserSelectionTable from "@/components/business/user/UserSelectionTable.vue";

const selectedUserIds = ref([]);

const handleSelectionChange = (ids) => {
  console.log("选中的用户ID:", ids);
};
</script>
```

## 📋 Props

| 属性                | 类型            | 默认值                               | 描述                                                                     |
| ------------------- | --------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `selectedIds`       | `Array<number>` | `[]`                                 | 已选择的用户ID列表，支持 v-model 双向绑定                                |
| `allowedRoles`      | `Array<string>` | `['scorer', 'admin', 'super_admin']` | 允许选择的角色列表，支持的值：`super_admin`, `admin`, `scorer`, `normal` |
| `showDisabledUsers` | `Boolean`       | `false`                              | 是否显示已禁用的用户                                                     |

## 📤 Emits

| 事件                 | 参数            | 描述                             |
| -------------------- | --------------- | -------------------------------- |
| `update:selectedIds` | `Array<number>` | 当选中的用户ID列表发生变化时触发 |

## 🎛️ 组件方法（通过 ref）

```javascript
// 通过 ref 访问组件实例
<UserSelectionTable ref="tableRef" />;

// 刷新用户列表
tableRef.value.refresh();

// 清空所有选择
tableRef.value.clearSelection();
```

## 🔄 角色配置说明

组件内置的角色映射：

```javascript
super_admin; // 超级管理员 (tag 类型: primary)
admin; // 管理员 (tag 类型: primary)
scorer; // 打分用户 (tag 类型: success)
normal; // 普通用户 (tag 类型: info)
```

## 💡 示例场景

### 场景 1: 评审团成员选择（当前实现）

```vue
<UserSelectionTable
  v-model:selectedIds="memberIds"
  :allowed-roles="['scorer', 'admin', 'super_admin']"
  :show-disabled-users="false"
/>
```

### 场景 2: 项目参与者选择

```vue
<UserSelectionTable
  v-model:selectedIds="participantIds"
  :allowed-roles="['scorer', 'normal']"
  :show-disabled-users="false"
/>
```

### 场景 3: 包括已禁用用户的全量选择

```vue
<UserSelectionTable
  v-model:selectedIds="allUserIds"
  :allowed-roles="['super_admin', 'admin', 'scorer', 'normal']"
  :show-disabled-users="true"
/>
```

## 🧠 可选：useUserSelection Composable

如果在 Script 中需要直接操作用户列表和选择状态，可使用 `useUserSelection` Composable：

```javascript
import { useUserSelection } from "@/pages/admin/reviewer-group/composables/useUserSelection";

const {
  selectedIds, // ref: 已选ID列表
  userList, // ref: 用户列表
  loading, // ref: 加载状态
  fetchUsers, // 获取用户列表方法
  setSelectedIds, // 设置已选ID
  getSelectedUsers, // 获取已选用户完整信息
  addUser, // 添加单个用户
  removeUser, // 移除单个用户
  clearSelection, // 清空选择
} = useUserSelection({
  allowedRoles: ["scorer"],
  showDisabled: false,
});

// 获取列表
await fetchUsers({ page: 1, size: 20 });

// 添加用户
addUser(123);

// 移除用户
removeUser(123);

// 获取已选用户的完整信息
const selectedUsers = getSelectedUsers();
```

## 🎨 样式定制

组件使用 Element Plus 的默认样式。如需自定义，可通过 CSS 作用域选择器覆盖：

```vue
<style scoped>
:deep(.user-selection-table .toolbar) {
  background-color: #f0f0f0;
}

:deep(.user-selection-table .pagination-container) {
  justify-content: center;
}
</style>
```

## ⚠️ 注意事项

1. **API 依赖** - 组件依赖 `userApi.getUserList()` API，确保该 API 返回格式匹配
2. **角色过滤** - 服务端返回的用户列表会在客户端按 `allowedRoles` 再次过滤
3. **状态同步** - 修改 `selectedIds` prop 时，表格会自动恢复选中状态
4. **分页重置** - 搜索、筛选、改变角色时，分页会自动重置到第1页

## 🔄 与原旧方案对比

### 原方案（el-select）

- ❌ 一个个点选，体验差
- ❌ 不支持全选、反选
- ❌ 搜索结果下拉显示，难以看全

### 新方案（UserSelectionTable）

- ✅ 表格展示，清晰直观
- ✅ 支持全选、反选、清空快捷操作
- ✅ 搜索、筛选、分页完整功能
- ✅ 可复用于其他需要用户多选的模块

## 📝 扩展建议

1. **拖拽排序** - 未来可添加拖拽改变成员顺序功能
2. **导出选项** - 支持导出已选用户列表
3. **预设模板** - 支持快速预设常用的选择组合
4. **权限管理** - 可扩展支持更细粒度的权限应用

---

**最后更新**: 2026-04-15
