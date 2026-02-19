<template>
  <header>
    <span class="title">
      {{ title }}
    </span>

    <div class="header-right">
      <div class="not-login" v-if="!userStore.isLogin">
        <button @click="goto('/login')">登录</button>
        <!-- <button>注册</button> -->
      </div>
      <div class="personnal-info" v-if="userStore.isLogin">
        <div class="avatar">
          <p>{{ username[0] }}</p>
          <ul class="dropdown">
            <li @click="goto('/personalInfo')">个人信息</li>
            <li @click="goto('/about')">关于OJ</li>
            <li @click="logout()" style="color:#cc3300;">退出登录</li>
          </ul>
        </div>
        <p class="username">{{ username }},欢迎</p>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
// import { comn } from "@/router/testRoutes";
import { pub } from "@/router/modules/publicRoutes";
import { useUserStore } from "@/stores/modules/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

function getTitle(routePath) {
  console.log(pub)
  const result = pub.find(item => item.name === 'MainLayout').children.find(item => '/' + item.path === routePath)
  return result ? result.name : "NULL"
}

const title = computed(() => {
  // console.log(route.path)
  console.log("change path to title:", getTitle(route.path));

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
  margin-bottom: 10px;
}


.title {
  /* border: 1px solid; */
  padding: 5px;
  text-align: center;
  font-size: larger;
  font-weight: bolder;

}

.not-login {
  display: flex;
  gap: 20px;

}

.not-login button {
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

.not-login button:hover {
  cursor: pointer;
  box-shadow: 0px 0px 15px var(--primary-box-shadow);
  transition: 0.25s;
}

.header-right {
  height: 40px;
  /* width: 10%; */
  display: flex;
  /* flex-direction: column; */
  justify-content: center;
  align-self: center;
}

.personnal-info {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.personnal-info .username {
  padding-bottom: 1px;
  padding-right: 5px;
  font-size: 15px;
  font-weight: 500;
  /* align-self: flex-end; */
}

.avatar {
  height: 35px;
  width: 35px;
  /* margin: 10px; */
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0px 0px 10px gray;
}

.avatar:hover {
  box-shadow: 0px 0px 10px rgba(1, 166, 255, 0.678);
  transition: 0.3s;
}

.dropdown {
  right: 0.1rem;
  width: 140px;
  position: absolute;
  padding-top: 60px;
  opacity: 0;
  line-height: 45px;
  transform: translateY(-60px);
  /* border: 1px solid; */
  transition: all 0.3s;
  z-index: 999;
}


.dropdown li {
  list-style: none;
  font-weight: bolder;
  text-align: center;
  margin-top: 2px;
  border-radius: 5px;
  background-color: rgb(252, 252, 252);
  box-shadow: 0px 0px 5px var(--gray-box-shadow);

}

.dropdown li:hover {
  background-color: rgb(158, 234, 255);
  box-shadow: 0px 0px 10px rgba(1, 166, 255, 0.678);
  transition: 0.2s;
}

.dropdown:hover {
  opacity: 1;
  /* background: #f5f7fa; */
  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  transform: translateY(75px);
}
</style>
