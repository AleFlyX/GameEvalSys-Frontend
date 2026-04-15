<template>
  <div>
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
              <li @click="openProfileModal">个人信息</li>
              <li @click="goto('/about')">关于OJ</li>
              <li @click="logout()" style="color:#cc3300;">退出登录</li>
            </ul>
          </div>
          <p class="username">{{ username }},欢迎</p>
        </div>
      </div>
    </header>

    <BaseFormModal :visible="showProfileModal" @update:visible="showProfileModal = $event">
      <template #title>
        个人信息
      </template>
      <template #form>
        <UserForm v-loading="submitPwdLoading" ref="profileFormRef" :init-data="profileData" :edit-mode="false"
          :user-self-edit-mode="true" :read-only="true">
        </UserForm>
      </template>
      <template #operations>
        <button @click="handleProfileSave" class="primary-btn" :disabled="submitPwdLoading">
          修改密码
        </button>
        <button @click="closeProfileModal" class="cancel-btn" :disabled="submitPwdLoading">
          关闭
        </button>
      </template>
    </BaseFormModal>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
// import { comn } from "@/router/testRoutes";
import { pub } from "@/router/modules/publicRoutes";
import { useUserStore } from "@/stores/modules/userStore";
import { useLoading } from "@/composables/useLodaing";
import { useMessage } from "@/composables/useMessage";
import { userApi } from "@/api/user";

import BaseFormModal from "@/components/common/modal/BaseFormModal.vue";
import UserForm from "@/components/business/user/user-form/UserForm.vue";
import { removeSpacesFromObject } from "@/utils/removeSpacesFromData";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

function getTitle(routePath) {
  console.log(pub)
  const result = pub.find(item => item.name === 'MainLayout').children.find(item => '/' + item.path === routePath)
  return result ? result.name : ""
}

const title = computed(() => {
  // console.log(route.path)
  console.log("change path to title:", getTitle(route.path));

  return getTitle(route.path)
});

const username = computed(() => userStore.userInfo?.username || "");

const showProfileModal = ref(false);
const profileFormRef = ref(null);
const profileData = ref({});

const buildProfileData = () => ({
  id: userStore.userInfo?.id || "",
  username: userStore.userInfo?.username || "",
  name: userStore.userInfo?.name || "",
  reviewerGroupIds: userStore.userInfo?.reviewerGroupIds || [],
  isEnabled: userStore.userInfo?.isEnabled ?? true,
  role: userStore.userInfo?.role || "normal",
  oldPassword: "",
  newPassword: ""
});

const openProfileModal = () => {
  profileData.value = buildProfileData();
  showProfileModal.value = true;
};

const closeProfileModal = () => {
  showProfileModal.value = false;
};

// 提交loading控制
const { isLoading: submitPwdLoading, start: submitStart, end: submitEnd } = useLoading('headerForm:submit');
const handleProfileSave = async () => {
  if (!profileFormRef.value || submitPwdLoading.value) {
    return;
  }

  const { valid, data } = await profileFormRef.value.validate();
  if (!valid) {
    message.error("请完善表单数据");
    return;
  }
  const { oldPassword, newPassword } = removeSpacesFromObject({ oldPassword: data.oldPassword, newPassword: data.newPassword }, true);
  console.log(oldPassword, newPassword)
  profileData.value.oldPassword = oldPassword;
  profileData.value.newPassword = newPassword;
  // const newPassword = data?.newPassword?.trim?.() || "";
  if (!oldPassword || !newPassword) {
    message.warning("请输入旧密码和新密码");
    return;
  }

  submitStart();
  try {
    const response = await userApi.editPassword({ oldPassword, newPassword });
    message.success(response.message || "密码修改成功");
    closeProfileModal();
  } catch (err) {
    message.error(`密码修改失败: ${err?.message || err}`);
  } finally {
    submitEnd();
  }
};


const goto = (path) => {
  console.log('jump to ', path)
  router.push(path)
}
const { requestWithLoading: logOutWithLoading } = useLoading()
const logout = async () => {
  await logOutWithLoading(userStore.logout);
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
  /* margin-bottom: 10px; */
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
  /* transform: translateY(-60px); */
  transform: translateY(-30%);
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
  /* transform: translateY(75px); */
  transform: translateY(30%);
}
</style>
