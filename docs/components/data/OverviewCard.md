# 组件名称

OvewviewCard.vue

> 数据预览卡片

## 快速使用

1. 组件引入

```javascript
// 局部引入
import OvewviewCard from "@/components/common/data/OverviewCard.vue";

// 全局引入（main.js）
import OverviewCard from "@/components/common/data/OverviewCard.vue";
app.component("OverviewCard", 组件名);
```

2. 基础使用示例

```html
<template>
  <OverviewCard title="标题" :visible="true" />
  <!-- 或使用v-for渲染多个 -->
  <OverviewCard
    v-for="card in overViewCardsMap"
    :key="card.title"
    :title="card.title"
    :icon="card.icon"
    :data="card.data"
    :icon-background="card.iconBackground"
    :icon-color="card.iconColor"
  >
  </OverviewCard>
</template>

<script setup>
  const overViewCardsMap = ref([
    { title: "总项目数", data: "23", icon: "Document", iconBackground: "", iconColor: "" },
    {
      title: "尚未开始的项目",
      data: "12",
      icon: "FolderOpened",
      iconBackground: "var(--warning-light)",
      iconColor: "var(--warning)",
    },
    {
      title: "进行中的项目",
      data: "2",
      icon: "Checked",
      iconBackground: "var(--success-light)",
      iconColor: "var(--success)",
    },
    {
      title: "已截止的项目",
      data: "3",
      icon: "Failed",
      iconBackground: "var(--danger-light)",
      iconColor: "var(--danger)",
    },
  ]);
</script>
```

---

## Props 参数说明

| 参数名             | 类型          | 默认值               | 是否必填 | 说明                           |
| :----------------- | :------------ | :------------------- | :------- | :----------------------------- |
| title              | String        | -                    | 否       | 标题文字                       |
| data               | String        | 'none'               | 否       | 要显示的预览数据               |
| width              | String/Number | 100%                 | 否       | 控制卡片宽度                   |
| height             | String/Number | 120px                | 否       | 卡片高度                       |
| icon               | String        | 'User'               | 否       | 卡片的图标                     |
| iconColor          | String        | var(--primary-havy)  | 否       | 卡片图标的颜色                 |
| iconBackground     | String        | var(--primary-light) | 否       | 卡片图标的背景色               |
| iconSize           | String/Number | 30                   | 否       | 卡片图标的大小(自带单位px)     |
| iconBackgroundSize | String/Number | 40                   | 否       | 卡片图标的背景大小(自带单位px) |

---

## Events 事件

| 事件名 | 回调参数 | 说明 |
| :----- | :------- | :--- |
| 无     | -        | -    |

---

## Slots 插槽

| 插槽名 | 说明 | 是否支持作用域插槽 |
| :----- | :--- | :----------------- |
| 无     | -    | -                  |

---

## Exposes / 公共方法（可选）

| 方法名 | 参数 | 返回值 | 说明 |
| :----- | :--- | :----- | :--- |
| 无     | -    | -      |

---

## 注意事项

- 本组件依赖 Element Plus库/样式
- 请勿在循环中直接修改 props
- 已知问题与使用限制
