<template>
  <div class="index">
    <nav>
      <SideBar @show-agent="handleShowAgent" />
    </nav>
    <div class="wrapper">
      <HeadBar />
      <main v-loading="isLoading">
        <el-skeleton v-if="isSkeleton" style="--el-skeleton-circle-size: 100px">
        </el-skeleton>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useLoading } from '@/composables/useLodaing';
import { usePageAgent } from '@/composables/usePageAgent';
import HeadBar from '@/layouts/components/head-bar/index.vue';
import SideBar from '@/layouts/components/side-bar/index.vue';

const { isLoading, isSkeleton } = useLoading('global:main'); //main内容全局加载

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
