<template>
  <header>
    <span class="title">
      {{ title }}
    </span>

    <div class="notLogin" v-if="!userStore.isLogin">
      <button @click="goto('/login')">登录</button>
      <!-- <button>注册</button> -->
    </div>
    <div class="avatar" v-if="userStore.isLogin">
      <p>{{ username[0] }}</p>
      <ul class="dropdown">
        <li @click="goto('/personalInfo')">个人信息</li>
        <li @click="goto('/about')">关于OJ</li>
        <li @click="logout()" style="color: brown;">退出登录</li>
      </ul>
    </div>


  </header>

</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import { comn } from "@/router/testRoutes";
import { useUserStore } from "@/stores/modules/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

function getTitle(routePath) {
  const result = comn.find(item => item.path === routePath)
  return result ? result.name : "NULL"
}

const title = computed(() => {
  console.log("change path to", getTitle(route.path));
  return getTitle(route.path)
});

const username = ref("");
username.value = userStore.userInfo.username;
// username.value = "abc"


const goto = (path) => {
  console.log('jump to ', path)
  router.push(path)
}
const logout = () => {
  userStore.logout();
  console.log("由头像dropdown登出")
}
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

.notLogin {
  display: flex;
  gap: 20px;

}

.notLogin button {
  width: 80px;
  /* border: none; */
  /* 清除默认边框 */
  outline: none;
  /* 清除点击聚焦的外边框 */
  background: var(--primary);
  border: none;
  border-radius: 20px;
  padding: 5px;

  color: rgba(255, 255, 255, 0.929);
  /* 清除默认背景色 */
}

.notLogin button:hover {
  box-shadow: 0px 0px 15px var(--primary-box-shadow);
  transition: 0.25s;
}

.avatar {
  /* position: relative; */
  height: 40px;
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  /* border: 1px solid; */
  box-shadow: 0px 0px 10px gray;

}

.avatar:hover {
  box-shadow: 0px 0px 10px rgba(1, 166, 255, 0.678);
  transition: 0.3s;
}

.dropdown {
  right: 0.2rem;
  width: 100px;
  position: absolute;
  opacity: 0;
  display: block;

  padding-top: 100px;
  transform: translateY(-95px);
  /* border: 1px solid; */
  transition: 0.2s;
}


.dropdown li {
  list-style: none;
  font-weight: bolder;
  transform: translateY(-40px);

  border: 0.5px solid rgba(80, 80, 80, 0.39);
  border-radius: 5px;
  line-height: 45px;
  text-align: center;
  /* width: 100%; */

}

.dropdown li:hover {
  background-color: rgba(1, 200, 255, 0.116);
  box-shadow: 0px 0px 10px rgba(1, 166, 255, 0.678);
  transition: 0.2s;
}

.dropdown:hover {
  opacity: 1;
  /* background: #f5f7fa; */

  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  /* box-shadow: 1px 1px 5px rgba(139, 139, 139, 0.61); */
  transform: translateY(100px);
  transition: 0.3s;
}
</style>
