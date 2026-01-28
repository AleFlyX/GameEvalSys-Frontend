<template>
  <div class="sidebar">
    <span class="title">项目评分平台</span>
    <ul class="navItems">
      <!--通过当前路由匹配，给li添加active类 -->
      <li v-for="li in routesMap" :key="li.name" @click="gotoRoute({ path: li.path })"
        :class="{ active: li.path == $route.path }">
        {{ li.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { routesMap } from "@/router/routes";
console.log(routesMap)
const router = useRouter();
// 跳转路由方法
function gotoRoute(pathObj) {
  //使用对象传参，对象类型会自动将数据转为str
  router.push(pathObj.path);
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 盒模型优化 */
}

.sidebar {
  display: flex;
  flex-direction: column;
  background-color: #2c3e50;
  color: #fff;
  height: 100%;
  /* margin: 5px; */
  /* height: calc(100vh - 10px); */
  /* 适配视口高度 */
  width: 220px;
  /* 固定宽度 */
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


.navItems {
  flex: 1;
  /* 占满剩余高度 */
  padding: 10px 0;
}

/* 导航项基础样式 */
.navItems li {
  list-style: none;
  line-height: 48px;
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
  cursor: pointer;
  /* 鼠标手型 */
  transition: all 0.2s ease;
  /* 过渡动画（流畅） */
  border-left: 7px solid transparent;
}

/* 鼠标悬浮样式 */
.navItems li:hover {
  background-color: #34495e;
  padding-left: 25px;
  /* 悬浮轻微缩进 */
}

/* 选中态样式 */
.navItems li.active {
  background-color: #1abc9c;
  /* （清新绿） */
  color: #fff;
  border-left-color: #0f997d;
  /* 左侧高亮边框 */
  padding-left: 25px;
}

/* 禁止选中 文字 */
.navItems li {
  user-select: none;
}
</style>
