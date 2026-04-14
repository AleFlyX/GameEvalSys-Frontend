<template>
  <div class="index">
    <nav>
      <SideBar @show-agent="handleShowAgent" />
    </nav>
    <div class="wrapper">
      <HeadBar />
      <main v-loading="isLoading" ref="mainZone">
        <el-skeleton v-if="isSkeleton" style="--el-skeleton-circle-size: 100px">
        </el-skeleton>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import { useLoading } from '@/composables/useLodaing';
import { usePageAgent } from '@/composables/usePageAgent';
import HeadBar from '@/layouts/components/head-bar/index.vue';
import SideBar from '@/layouts/components/side-bar/index.vue';

const { isLoading, isSkeleton } = useLoading(); //main内容全局加载

const route = useRoute();
const mainZone = ref(null);

// 监听路由变化（路径或完整路由对象变化时触发）
watch(
  () => route.path,          // 也可以直接 watch route 对象
  async () => {
    // 等待 DOM 更新完成，确保 main 容器的内容已刷新
    await nextTick();
    // 安全地调用滚动方法
    mainZone.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
);

const agent = usePageAgent();
const handleShowAgent = (event) => {
  if (event) agent.show();
  else agent.close();
}
</script>
<style scoped>
.index {
  display: flex;
  flex-direction: row;
  /* border: 1px solid; */
  height: 100vh;
}

.wrapper {
  display: flex;
  width: 100%;
  /* border: 1px solid gold; */
  flex-direction: column;
}

main {
  padding-bottom: 20px;
  overflow-y: auto;
}
</style>
