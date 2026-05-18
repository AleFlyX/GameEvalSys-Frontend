<template>
  <div>
    <header class="head-bar">
      <span class="title" :title="title">
        {{ title }}
      </span>

      <div class="header-right">
        <div class="not-login" v-if="!userStore.isLogin">
          <button class="header-btn" @click="goto('/login')">登录</button>
        </div>

        <div class="personal-info" v-if="userStore.isLogin">
          <el-dropdown trigger="click" @command="handleCommand" placement="bottom-end">
            <div class="user-trigger">
              <el-avatar :size="34" class="avatar-gradient">
                <span class="avatar-text">{{ avatarText }}</span>
              </el-avatar>
              <span class="username">{{ username }}</span>
              <el-icon class="dropdown-icon">
                <Setting />
              </el-icon>
            </div>

            <template #dropdown>
              <el-dropdown-menu class="modern-dropdown">
                <div class="dropdown-header">
                  <div class="header-info">
                    <span class="header-name">{{ username }}</span>
                    <span class="header-role">{{ userRoleName }}</span>
                  </div>
                </div>

                <el-dropdown-item command="profile">
                  <el-icon>
                    <User />
                  </el-icon>个人信息
                </el-dropdown-item>

                <el-dropdown-item command="about">
                  <el-icon>
                    <Link />
                  </el-icon>关于OJ实验室
                </el-dropdown-item>

                <el-dropdown-item divided command="logout" class="danger-item">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <BaseFormModal :visible="showProfileModal" @update:visible="showProfileModal = $event">
      <template #title>
        个人信息
      </template>
      <template #form>
        <UserForm v-loading="submitPwdLoading" ref="profileFormRef" :init-data="profileData" :edit-mode="false"
          :user-self-edit-mode="true" :read-only="true" style="padding: 10px;">
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
import { useLoading } from "@/composables/useLoading";
import { useMessage } from "@/composables/useMessage";
import { userApi } from "@/api/user";
import { elementIconMap } from "@/utils/elementIcons";

import BaseFormModal from "@/components/common/modal/BaseFormModal.vue";
import UserForm from "@/components/business/user/user-form/UserForm.vue";
import { removeSpacesFromObject } from "@/utils/removeSpacesFromData";

defineOptions({
  name: "HeadBar"
});

const { User, SwitchButton, Setting, Link } = elementIconMap;

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

const title = computed(() => {
  return route.meta?.title || "";
});

const username = computed(() => userStore.userInfo?.username || "");
const avatarText = computed(() => (username.value?.[0] || "U").toUpperCase());
const userRoleName = computed(() => {
  const roleMap = {
    super_admin: '超级管理员',
    admin: '管理员',
    scorer: '打分员',
    normal: '普通用户'
  };
  return roleMap[userStore.userRole] || '用户';
});

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

const handleCommand = (command) => {
  if (command === 'profile') {
    openProfileModal();
  } else if (command === 'about') {
    goto('/about');
  } else if (command === 'logout') {
    logout();
  }
};

</script>
<style scoped>
.head-bar {
  position: relative;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--card-bg, #ffffff);
  padding: 0 24px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
}

/* User Trigger */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  border: none;
  outline: none;
}

.user-trigger:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.04));
}

html[data-theme="dark"] .user-trigger:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.avatar-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.avatar-text {
  font-size: 15px;
  font-weight: 700;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-regular, #4b5563);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  color: var(--text-secondary, #9ca3af);
  font-size: 14px;
  transition: transform 0.3s ease;
}

.user-trigger:hover .dropdown-icon {
  color: var(--text-primary, #1f2937);
}

/* Dropdown Menu overrides */
:global(.modern-dropdown) {
  padding: 6px 0 !important;
  min-width: 180px;
}

:global(.modern-dropdown .dropdown-header) {
  padding: 10px 16px 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border-light, #f3f4f6);
}

html[data-theme="dark"] :global(.modern-dropdown .dropdown-header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

:global(.modern-dropdown .header-info) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:global(.modern-dropdown .header-name) {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

:global(.modern-dropdown .header-role) {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

:global(.modern-dropdown .danger-item) {
  color: var(--danger, #ef4444);
}

:global(.modern-dropdown .danger-item:hover) {
  color: var(--danger-hover, #dc2626) !important;
  background-color: var(--danger-light, #fef2f2) !important;
}

html[data-theme="dark"] :global(.modern-dropdown .danger-item:hover) {
  background-color: rgba(239, 68, 68, 0.1) !important;
}

.header-btn {
  padding: 0 20px;
  height: 36px;
  background: var(--primary, #3b82f6);
  border: none;
  border-radius: 18px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: var(--primary-hover, #2563eb);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

@media (max-width: 768px) {
  .head-bar {
    padding: 0 16px;
    min-height: 54px;
  }

  .title {
    font-size: 16px;
  }

  .username,
  .dropdown-icon {
    display: none;
  }

  .user-trigger {
    padding: 2px;
  }
}
</style>
