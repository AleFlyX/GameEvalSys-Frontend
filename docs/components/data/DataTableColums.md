# DataTableColumns 组件文档

基于 Element Plus `el-table-column` 封装的通用表格列组件，支持通过配置化方式快速生成表格列，内置图标、标签（Tag）、嵌套字段解析等常用功能。

---

## 一、组件特性

- **配置化列定义**：通过 `colRules` 数组一键配置多列
- **支持嵌套字段**：自动解析 `user.info.name` 这类多层级数据
- **内置图标展示**：可在列中渲染 Element Plus 图标组件
- **标签（Tag）映射**：支持通过数据值映射不同类型和文本的标签
- **自适应布局**：单元格内容默认居中对齐

---

## 二、Props 说明

### `colRules`（列配置数组）

| 属性名        | 类型             | 必填 | 默认值     | 说明                                                                      |
| ------------- | ---------------- | ---- | ---------- | ------------------------------------------------------------------------- |
| `label`       | String           | 否   | `'空标题'` | 列头显示文本                                                              |
| `width`       | String           | 否   | `'auto'`   | 列宽度，如 `'150'`、`'200px'`                                             |
| `colDataName` | String           | 否   | -          | 数据字段名，支持嵌套格式（如 `'user.profile.name'`）                      |
| `icon`        | String/Component | 否   | `'none'`   | 图标组件，传入 Element Plus 图标组件（如 `Edit`），值为 `'none'` 时不显示 |
| `tagTypeMap`  | Object           | 否   | -          | 标签类型映射，如 `{ 1: 'success', 0: 'danger' }`                          |
| `tagNameMap`  | Object           | 否   | -          | 标签文本映射，如 `{ 1: '启用', 0: '禁用' }`                               |

---

## 三、使用示例

### 1. 基础用法（纯文本列）

```html
<template>
  <el-table :data="tableData">
    <DataTableColumns :col-rules="colRules" />
  </el-table>
</template>

<script setup>
  import DataTableColumns from "./DataTableColumns.vue";

  const tableData = [{ id: 1, name: "张三", email: "zhangsan@example.com" }];

  const colRules = [
    { label: "ID", width: "80", colDataName: "id" },
    { label: "姓名", width: "120", colDataName: "name" },
    { label: "邮箱", colDataName: "email" },
  ];
</script>
```

### 2. 带标签的状态列

```html
<script setup>
  const colRules = [
    {
      label: "状态",
      width: "100",
      colDataName: "status",
      tagTypeMap: { 1: "success", 0: "danger", 2: "warning" },
      tagNameMap: { 1: "启用", 0: "禁用", 2: "待审核" },
    },
  ];
</script>
```

### 3. 带图标的列

```html
<script setup>
  import { Edit, Delete } from "@element-plus/icons-vue";

  const colRules = [
    {
      label: "操作",
      width: "100",
      colDataName: "id",
      icon: Edit, // 传入图标组件
    },
  ];
</script>
```

### 4. 嵌套字段解析

```html
<script setup>
  const tableData = [
    {
      id: 1,
      user: {
        profile: {
          name: "李四",
        },
      },
    },
  ];

  const colRules = [{ label: "用户名", colDataName: "user.profile.name" }];
</script>
```

---

## 四、样式说明

- 单元格内容默认 **水平+垂直居中**
- 内置类名：
  - `.table-header-cell`：表头单元格容器
  - `.table-body-cell`：表体单元格容器
  - `.cell-tag`：标签元素
  - `.cell-text`：文本元素

可通过 `:deep()` 或全局样式覆盖默认样式。

---

## 五、注意事项

1. `tagTypeMap` 和 `tagNameMap` 必须 **同时配置** 才会渲染标签
2. 嵌套字段解析时，若中间层级不存在会显示 `'字段不存在'`
3. 图标需从 `@element-plus/icons-vue` 引入并传入组件实例
4. `colDataName` 为空时会显示 `'Empty Data'`

---
