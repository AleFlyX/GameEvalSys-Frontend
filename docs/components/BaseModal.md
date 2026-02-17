# 组件名称

BaseModal.vue

> 弹窗样式/过渡动画接口组件,本组件对弹窗开关的过度动画、按钮样式（btn,primary-btn,danger-btn）的css进行封装，在封装特定通用弹窗之前可引用此组件来添加基本样式

## 快速使用

1. 组件引入

```javascript
// 局部引入
import BaseModal from "@/components/common/modal/BaseModal.vue";

// 全局引入（main.js）
import BaseModal from "@/components/common/modal/BaseModal.vue";
app.component("BaseModal", BaseModal);
```

2. 基础使用示例

```html
<template>
  <BaseModal>
    <div class="modal-mask" @click="closeModal" v-if="visible">
      <div class="confirm-delete" @click.stop v-if="visible">
        <!-- ...... -->
      </div>
    </div>
    <!-- 基础按钮样式 -->
    <div class="operations">
      <button class="btn">Btn</button>
      <button class="primary-btn">PrimaryBtn</button>
      <button class="danger-btn">DangerBtn</button>
    </div>
  </BaseModal>
</template>
```

---

## Props 参数说明

无

---

## Events 事件

无

---

## Slots 插槽

| 插槽名 | 说明               | 是否支持作用域插槽 |
| :----- | :----------------- | :----------------- |
| —      | 默认插槽：内容区域 | 否                 |

---

## Exposes / 公共方法

无

---

## 注意事项

- 本组件
