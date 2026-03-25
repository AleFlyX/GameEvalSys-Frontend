# 📘 `useElPagination` 使用文档

## 🧩 一、简介

`useElPagination` 是一个基于 Vue3 Composition API 封装的分页逻辑 Hook，专门用于适配 `Element Plus` 的 `<el-pagination>` 组件。

✔ 自动处理分页状态
✔ 自动触发数据请求
✔ 避免页码越界
✔ 统一分页逻辑（推荐所有表格复用）

---

## 📦 二、基础用法（推荐写法）

### 1️⃣ 引入并初始化

```js
import { useElPagination } from "@/composables/useElPagination";

const {
  currentPage,
  pageSize,
  total,
  disabled,
  defaultPageSizes,
  handleSizeChange,
  handleCurrentChange,
} = useElPagination({
  initialPage: 1,
  initialPageSize: 10,
  defaultPageSizes: [10, 20, 50],
  onPageChange: async (page, size) => {
    await getList({ page, size });
  },
});
```

---

### 2️⃣ 绑定到 el-pagination

```vue
<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="defaultPageSizes"
  :total="total"
  :disabled="disabled"
  layout="sizes, prev, pager, next"
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
/>
```

---

### 3️⃣ 请求数据

```js
const tableData = ref([]);

const getList = async ({ page, size }) => {
  const res = await api.getList({ page, size });
  tableData.value = res.data.list;

  // ⭐ 必须设置 total
  total.value = res.data.total;
};
```

---

## ⚙️ 三、参数说明

### `useElPagination(options)`

| 参数名           | 类型     | 默认值        | 说明         |
| ---------------- | -------- | ------------- | ------------ |
| initialPage      | number   | 1             | 初始页码     |
| initialPageSize  | number   | 10            | 每页条数     |
| defaultPageSizes | number[] | [10,20,30,50] | 分页选择     |
| maxPageSize      | number   | 100           | 最大每页条数 |
| onPageChange     | function | () => {}      | 页码变化回调 |

---

## 📤 四、返回值说明

| 字段                | 类型         | 说明               |
| ------------------- | ------------ | ------------------ |
| currentPage         | ref<number>  | 当前页             |
| pageSize            | ref<number>  | 每页条数           |
| total               | ref<number>  | 总条数             |
| disabled            | ref<boolean> | 是否禁用分页       |
| totalPages          | computed     | 总页数             |
| hasPrevPage         | computed     | 是否有上一页       |
| hasNextPage         | computed     | 是否有下一页       |
| defaultPageSizes    | array        | 分页选项           |
| setTotal            | function     | 设置总数           |
| setCurrentPage      | function     | 设置页码           |
| setPageSize         | function     | 设置页大小         |
| resetPagination     | function     | 重置分页           |
| prevPage            | function     | 上一页             |
| nextPage            | function     | 下一页             |
| handleSizeChange    | function     | el-pagination 事件 |
| handleCurrentChange | function     | el-pagination 事件 |

---

## 🚨 五、重要注意事项（必须看）

### ❗ 1. 不要用 `pagination.total`

错误写法：

```vue
:total="pagination.total" ❌
```

原因：

👉 这是一个 `ref` 对象
👉 Element Plus 可能无法正确解析

---

### ✅ 正确写法

```js
const { total } = useElPagination();
```

```vue
:total="total" ✅
```

---

### ❗ 2. 每次请求必须设置 total

```js
total.value = res.data.total;
```

否则：

👉 分页不会更新
👉 页码计算错误

---

### ❗ 3. pageSize 改变会自动回到第一页

```js
setPageSize(size);
```

👉 内部逻辑：

```js
currentPage.value = 1;
```

✔ 符合大部分后端分页逻辑

---

### ❗ 4. onPageChange 自动触发

你不需要手动监听：

```js
watch(currentPage);
```

因为内部已经做了：

```js
watch([currentPage, pageSize]);
```

---

## 🔄 六、完整示例（推荐模板）

```vue
<script setup>
import { ref } from "vue";
import { useElPagination } from "@/composables/useElPagination";
import { userApi } from "@/api/user";

const tableData = ref([]);

const { currentPage, pageSize, total, handleSizeChange, handleCurrentChange } = useElPagination({
  onPageChange: async (page, size) => {
    await fetchData(page, size);
  },
});

const fetchData = async (page, size) => {
  const res = await userApi.getUserList({ page, size });
  tableData.value = res.data.list;
  total.value = res.data.total;
};
</script>

<template>
  <el-table :data="tableData"></el-table>

  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    layout="sizes, prev, pager, next"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>
```

---

## 🚀 七、进阶用法

### 1️⃣ 重置分页（常用于搜索）

```js
pagination.resetPagination();
```

👉 然后重新请求数据

---

### 2️⃣ 手动跳页

```js
pagination.setCurrentPage(5);
```

---

### 3️⃣ 控制分页禁用（推荐优化）

```js
const disabled = computed(() => total.value === 0);
```

---

## 🧠 八、最佳实践总结

✔ 一定要解构使用（避免 ref 嵌套问题）
✔ total 必须从接口同步
✔ 不要手写 watch
✔ 分页逻辑统一放 composable

---

## 📌 一句话总结

> `useElPagination` = **状态管理 + 自动请求触发 + el-pagination 适配器**

---
