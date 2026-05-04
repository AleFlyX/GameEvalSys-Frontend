<template>
  <div class="online-panel">
    <base-card shadow="hover" class="online-card">
      <div class="online-toolbar">
        <div>
          <div class="page-title">在线用户</div>
          <div class="page-subtitle">当前展示处于在线状态的用户，支持查看会话和强制下线</div>
        </div>
        <div class="toolbar-meta">
          <span class="toolbar-count">{{ total }} 人在线</span>
          <span class="toolbar-dot">·</span>
          <span>最近刷新 {{ pageSize }} 条</span>
        </div>
      </div>

      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="70px" class="online-form">
        <el-form-item label="关键词" prop="keyWords">
          <el-input v-model="queryParams.keyWords" placeholder="用户名/姓名关键词" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="queryParams.role" placeholder="全部角色" clearable style="width: 120px;">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="打分用户" value="scorer" />
            <el-option label="普通用户" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="isEnabled">
          <el-select v-model="queryParams.isEnabled" placeholder="全部" clearable style="width: 100px;">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="在线" prop="onlineOnly">
          <el-switch v-model="queryParams.onlineOnly" />
        </el-form-item>
        <el-form-item class="online-form-actions">
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <online-user-list :list="onlineList" :loading="loading" @open-sessions="handleOpenSessions"
        @kick-all="handleKickAll" />

      <div class="online-pagination">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next, sizes" :page-sizes="[10, 20, 50, 100]" background
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </base-card>

    <online-session-dialog v-model:visible="sessionDialogVisible" :user="currentSessionUser" :sessions="sessionList"
      :loading="sessionLoading" @kick-session="handleKickSession" />
  </div>
</template>

<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';
import { ref, onMounted } from 'vue';
import { userApi } from '@/api/user';
import { showMsgBox } from '@/utils/ConfirmBox';
import { useMessage } from '@/composables/useMessage';
import OnlineSessionDialog from './components/OnlineSessionDialog.vue';
import OnlineUserList from './components/OnlineUserList.vue';
defineOptions({
  name: 'OnlineMonitorIndex',
});

const message = useMessage();

const queryRef = ref(null);
const onlineList = ref([]);
const loading = ref(false);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const sessionDialogVisible = ref(false);
const sessionLoading = ref(false);
const sessionList = ref([]);
const currentSessionUser = ref({});

const queryParams = ref({
  role: 'scorer',
  keyWords: '',
  isEnabled: null,
  onlineOnly: true,
});

async function getList() {
  loading.value = true;
  try {
    const params = {
      page: pageNum.value,
      size: pageSize.value,
      role: queryParams.value.role || 'scorer',
      keyWords: queryParams.value.keyWords || undefined,
      onlineOnly: queryParams.value.onlineOnly,
    };
    if (queryParams.value.isEnabled !== null && queryParams.value.isEnabled !== undefined) {
      params.isEnabled = queryParams.value.isEnabled;
    }
    const response = await userApi.getOnlineUsers(params);
    const data = response.data || {};
    onlineList.value = Array.isArray(data.list) ? data.list : [];
    total.value = Number(data.total || 0);
    pageNum.value = Number(data.page || pageNum.value);
    pageSize.value = Number(data.size || pageSize.value);
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  pageNum.value = 1;
  getList();
}

function resetQuery() {
  queryParams.value.role = 'scorer';
  queryParams.value.keyWords = '';
  queryParams.value.isEnabled = null;
  queryParams.value.onlineOnly = true;
  handleQuery();
}


async function handleKickAll(row) {
  const username = row?.username || '';
  const userId = row?.id;
  if (!userId) return;
  try {
    await showMsgBox("提示", `是否确认将用户“${username}”的全部会话踢下线？`, {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await userApi.kickAllSessionsByUser(userId);
    message.success("操作成功");
    await getList();
  } catch {
    // 用户取消弹窗时忽略
  }
}

async function handleOpenSessions(row) {
  const userId = row?.id;
  if (!userId) return;
  currentSessionUser.value = {
    id: userId,
    username: row?.username || '',
    name: row?.name || '',
  };
  sessionDialogVisible.value = true;
  sessionLoading.value = true;
  try {
    const response = await userApi.getAdminSessionsByUser(userId);
    sessionList.value = Array.isArray(response.data) ? response.data : [];
  } finally {
    sessionLoading.value = false;
  }
}

async function handleKickSession(sessionRow) {
  const sid = sessionRow?.sid;
  if (!sid) return;
  try {
    await showMsgBox("提示", "是否确认踢除此会话？", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await userApi.kickSessionBySid(sid);
    message.success("会话已踢下线");
    await handleOpenSessions(currentSessionUser.value);
    await getList();
  } catch {
    // 用户取消弹窗时忽略
  }
}

function handleSizeChange(size) {
  pageSize.value = size;
  pageNum.value = 1;
  getList();
}

function handlePageChange(page) {
  pageNum.value = page;
  getList();
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.online-panel {
  width: 100%;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.8), transparent 26%),
    linear-gradient(180deg, #f6f8fa 0%, #edf1f5 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px 0;
  box-sizing: border-box;
}

.online-card {
  width: 100%;
  max-width: 1350px;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.07), 0 1.5px 6px 0 rgba(0, 0, 0, 0.03);
  padding: 24px 28px 30px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e6ebf2;
}

.online-card :deep(.el-card__body) {
  padding: 0;
}

.online-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.page-title {
  color: #101828;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
}

.page-subtitle {
  margin-top: 8px;
  color: #667085;
  font-size: 13px;
}

.toolbar-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #667085;
  font-size: 13px;
}

.toolbar-count {
  color: #101828;
  font-weight: 700;
}

.toolbar-dot {
  color: #98a2b3;
}

.online-form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eef2f6;
}

.online-form :deep(.el-form-item__label) {
  color: #344054;
}

.online-form :deep(.el-input__wrapper),
.online-form :deep(.el-select__wrapper) {
  background: #fff;
  box-shadow: none;
  border: 1px solid #d9e2ec;
}

.online-form-actions {
  margin-left: auto;
}

.online-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.online-pagination :deep(.el-pagination__total),
.online-pagination :deep(.btn-prev),
.online-pagination :deep(.btn-next),
.online-pagination :deep(.el-pager li),
.online-pagination :deep(.el-input__inner) {
  color: #344054;
}

.online-pagination :deep(.el-pager li.is-active) {
  color: #fff;
  background: #409eff;
}

@media (max-width: 1200px) {
  @media (max-width: 980px) {
    .online-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .online-form {
      gap: 10px 0;
    }
  }

  @media (max-width: 700px) {
    .online-panel {
      padding: 14px 0;
    }

    .online-card {
      padding: 18px 14px 22px;
      border-radius: 14px;
    }

    .page-title {
      font-size: 24px;
    }

    .online-pagination {
      justify-content: center;
    }
  }
}
</style>
