<template>
  <header>
    <span class="title">
      {{ title }}
    </span>
    <div class="avatar">
      <span>to</span>
    </div>
  </header>

</template>
<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { routesMap } from "@/router/routes";

const route = useRoute();

function getTitle(routePath) {
  const result = routesMap.find(item => item.path === routePath)
  return result ? result.name : "NULL"
}

const title = computed(() => {
  console.log("change path to", getTitle(route.path));
  return getTitle(route.path)
});

// onMounted(()=>{
//   getTitle();
// })
// const title=ref(routesMap[])

// const title=routesMap.fin
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}

header {
  /* width: 100%; */
  background-color: var(--light-background);
  padding: 8px;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 1px 1px 8px gray;
}

.title {
  /* border: 1px solid; */
  padding: 5px;
  text-align: center;
  font-size: larger;
  font-weight: bolder;

}

.avatar {
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid;

}

.avatar span {
  height: 100%;
  width: 100%;
  position: relative;
  /* border-radius: 50%; */
  text-align: center;

  /* top: 10px; */
  /* left: 25%; */
  /* border: 1px solid; */
}
</style>
