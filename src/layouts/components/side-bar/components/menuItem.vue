<template>
  <li class="menu-item" :class="{ active: props.active, 'sub-item': props.type === 'subMenu', show: props.show }">
    <slot>

    </slot>
  </li>
</template>
<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'default' //default/subMenu
  }
})
</script>
<style scoped>
/* 所有菜单项基础样式 */
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

/* 折叠子项基础样式 */
.menu-item.sub-item {
  font-weight: 400;
  border-left: 7px solid transparent;
  padding: 0 0px;
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
