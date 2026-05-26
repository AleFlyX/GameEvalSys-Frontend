<template>

  <h2>Full Path</h2>
  <pre>{{ $route.fullPath }}</pre>
  <MyBtn @click="showRouteTree = !showRouteTree">显示路由树</MyBtn>
  <div v-if="showRouteTree">
    <h1>Router Tree Data</h1>
    <pre>{{ $route.matched }}</pre>
  </div>
  <MyBtn @click="showSidebarRoutes = !showSidebarRoutes">显示侧边栏完整路由</MyBtn>
  <pre v-if="showSidebarRoutes">{{ totalRoutes }}</pre>
</template>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
router.getRoutes().forEach(route => {
  console.log('Route:', route);
});
const totalRoutes = router.getRoutes();
const showRouteTree = ref(false);
const showSidebarRoutes = ref(false);


</script>
