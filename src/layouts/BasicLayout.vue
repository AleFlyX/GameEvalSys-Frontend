<template>
  <div class="index">
    <nav>
      <SideBar />
    </nav>
    <div class="wrapper">
      <HeadBar />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import HeadBar from '@/components/HeadBar.vue';
import SideBar from '@/components/SideBar.vue';
import { RouterView } from 'vue-router';
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
</style>
