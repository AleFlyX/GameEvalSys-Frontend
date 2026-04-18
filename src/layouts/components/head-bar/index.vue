<template>
  <div>
    <header>
      <span class="title" :title="title">
        {{ title }}
      </span>

      <div class="header-right">
        <div class="not-login" v-if="!userStore.isLogin">
          <button class="header-btn" @click="goto('/login')">登录</button>
          <!-- <button>注册</button> -->
        </div>
        <div class="personal-info" v-if="userStore.isLogin">
          <div class="avatar" tabindex="0" aria-label="用户菜单">
            <p class="avatar-text">{{ avatarText }}</p>
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

const title = computed(() => {
  return route.meta?.title || "";
});

const username = computed(() => userStore.userInfo?.username || "");
const avatarText = computed(() => (username.value?.[0] || "U").toUpperCase());

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
  router.push(path)
}
const { requestWithLoading: logOutWithLoading } = useLoading()
const logout = async () => {
  await logOutWithLoading(userStore.logout);
}

</script>
<style scoped>
header {
  position: relative;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--light-background);
  padding: 0 16px;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: visible;
}

.title {
  padding: 4px 0;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.not-login {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  width: 80px;
  height: 34px;
  background: var(--primary);
  border: none;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.22s ease;
}

.header-btn:hover {
  cursor: pointer;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--primary-box-shadow);
}

.header-right {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  overflow: visible;
}

.personal-info {
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
  overflow: visible;
}

.personal-info .username {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.avatar {
  height: 35px;
  width: 35px;
  position: relative;
  z-index: 120;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #36a2ff 0%, #1f7bd7 100%);
  box-shadow: 0 4px 12px rgba(54, 162, 255, 0.4);
  color: #fff;
  cursor: pointer;
  user-select: none;
  outline: none;
}

.avatar-text {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.avatar:hover,
.avatar:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(1, 166, 255, 0.55);
  transition: all 0.24s ease;
}

.dropdown {
  left: 50%;
  top: 100%;
  width: 140px;
  position: absolute;
  padding-top: 8px;
  opacity: 0;
  transform: translate(-50%, -4px);
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 2000;
  margin: 0;
}

.dropdown::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 10px;
}

.dropdown li {
  list-style: none;
  font-weight: 600;
  text-align: center;
  margin-top: 4px;
  border-radius: 8px;
  line-height: 40px;
  background-color: rgb(252, 252, 252);
  box-shadow: 0 4px 12px var(--gray-box-shadow);
  color: #374151;
}

.dropdown li:hover {
  background-color: rgb(214, 244, 255);
  box-shadow: 0 6px 14px rgba(1, 166, 255, 0.45);
  transition: 0.2s;
}

.avatar:hover .dropdown,
.avatar:focus-within .dropdown,
.personal-info:hover .dropdown,
.personal-info:focus-within .dropdown,
.dropdown:hover {
  opacity: 1;
  transform: translate(-50%, 0);
  pointer-events: auto;
}

@media (max-width: 768px) {
  header {
    min-height: 52px;
    padding: 0 12px;
    gap: 10px;
  }

  .title {
    font-size: 17px;
    max-width: 56vw;
  }

  .personal-info .username {
    display: none;
  }

  .not-login {
    gap: 8px;
  }

  .header-btn {
    width: 72px;
    height: 32px;
    font-size: 13px;
  }
}
</style>
