<template>
  <div class="not-found-page">
    <el-icon size="80" color="#f56c6c">
      <CircleCloseFilled />
    </el-icon>
    <h2 class="not-found-title">403 - 页面无权访问</h2>
    <!-- 展示用户输入的错误路径 -->
    <p class="not-found-desc">你访问的路径 <span class="error-path">{{ errorPath }}</span> 当前账户无权访问</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { CircleCloseFilled } from '@element-plus/icons-vue';
const router = useRouter();
const route = useRoute();

// 获取用户输入的错误路径（通配符路由匹配到的路径）
// 当前方法拿不到这路径，debug
const errorPath = route.params.pathMatch || '/';

// 返回首页
const goHome = () => {
  router.push('/home');
};
</script>

<style>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
