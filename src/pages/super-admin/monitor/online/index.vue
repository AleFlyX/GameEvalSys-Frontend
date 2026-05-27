<template>
  <PagePanel class="online-monitor-page">
    <template #header>
      <StatCard v-for="item in overviewCards" :key="item.label" class="overview-card" :label="item.label"
        :value="item.value" :sub="item.sub" label-placement="body" :icon="item.icon" :icon-color="item.iconColor"
        :icon-bg="item.iconBg" :icon-size="42" :icon-radius="14" />
    </template>

    <div class="online-toolbar-shell">
      <!-- <section class="page-hero">
        <div>
          <p class="hero-eyebrow">Session Monitor</p>
          <h1 class="page-title">在线用户</h1>
          <p class="page-subtitle">统一查看当前在线用户、最近活跃情况和会话状态，支持快速定位与强制下线。</p>
        </div>
        <div class="toolbar-meta">
          <span class="toolbar-chip">在线 {{ onlineUserCount }} 人</span>
          <span class="toolbar-chip">活跃会话 {{ activeSessionCount }} 个</span>
          <span class="toolbar-chip">本页 {{ onlineList.length }} 条</span>
        </div>
      </section> -->

      <section class="filter-panel">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="70px" class="online-form">
          <el-form-item label="关键词" prop="keyWords">
            <el-input v-model="queryParams.keyWords" placeholder="用户名/姓名关键词" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="queryParams.role" placeholder="全部角色" clearable style="width: 140px;">
              <el-option label="超级管理员" value="super_admin" />
              <el-option label="管理员" value="admin" />
              <el-option label="打分用户" value="scorer" />
              <el-option label="普通用户" value="normal" />
            </el-select>
          </el-form-item>
          <el-form-item label="启用状态" prop="isEnabled">
            <el-select v-model="queryParams.isEnabled" placeholder="全部" clearable style="width: 120px;">
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="只看活跃" prop="onlineOnly">
            <el-switch v-model="queryParams.onlineOnly" />
          </el-form-item>
          <el-form-item class="online-form-actions">
            <MyBtn type="primary" @click="handleQuery">搜索</MyBtn>
            <MyBtn type="secondary" @click="resetQuery">重置</MyBtn>
          </el-form-item>
        </el-form>
      </section>
    </div>

    <template #main-table>
      <online-user-list :list="onlineList" :loading="loading" @open-sessions="handleOpenSessions"
        @kick-all="handleKickAll" />
    </template>

    <template #footer>
      <div class="online-pagination">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next, sizes" :page-sizes="[10, 20, 50, 100]" background
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </template>

    <template #modals>
      <online-session-dialog v-model:visible="sessionDialogVisible" :user="currentSessionUser" :sessions="sessionList"
        :loading="sessionLoading" @kick-session="handleKickSession" />
    </template>
  </PagePanel>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { userApi } from '@/api/user';
import { showMsgBox } from '@/utils/ConfirmBox';
import { useMessage } from '@/composables/useMessage';

import PagePanel from '@/layouts/PagePanel.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import MyBtn from '@/components/common/form/MyBtn.vue';
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
  role: null,
  keyWords: '',
  isEnabled: null,
  onlineOnly: true,
});

const activeSessionCount = computed(() => {
  return onlineList.value.reduce((sum, row) => sum + Number(row?.onlineCount || 0), 0);
});

const onlineUserCount = computed(() => {
  return onlineList.value.filter((row) => Number(row?.onlineCount || 0) > 0).length;
});

const disabledUserCount = computed(() => {
  return onlineList.value.filter((row) => row?.isEnabled === false).length;
});

const overviewCards = computed(() => [
  {
    label: '在线用户',
    value: String(onlineUserCount.value),
    sub: `总用户 ${total.value}`,
    icon: 'UserFilled',
    iconColor: '#2563eb',
    iconBg: 'rgba(37, 99, 235, 0.12)',
  },
  {
    label: '活跃会话',
    value: String(activeSessionCount.value),
    sub: '当前页会话总量',
    icon: 'Connection',
    iconColor: '#0f766e',
    iconBg: 'rgba(15, 118, 110, 0.12)',
  },
  {
    label: '禁用账号',
    value: String(disabledUserCount.value),
    sub: '当前页异常状态',
    icon: 'Warning',
    iconColor: '#d97706',
    iconBg: 'rgba(217, 119, 6, 0.14)',
  },
  {
    label: '筛选模式',
    value: queryParams.value.onlineOnly ? '在线' : '全部',
    sub: queryParams.value.role ? `角色 ${queryParams.value.role}` : '全部角色',
    icon: 'Filter',
    iconColor: '#7c3aed',
    iconBg: 'rgba(124, 58, 237, 0.12)',
  },
]);

async function getList() {
  loading.value = true;
  try {
    const params = {
      page: pageNum.value,
      size: pageSize.value,
      role: queryParams.value.role || null,
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
  queryParams.value.role = null;
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
    await showMsgBox('提示', `是否确认将用户“${username}”的全部会话踢下线？`, {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await userApi.kickAllSessionsByUser(userId);
    message.success('操作成功');
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
    await showMsgBox('提示', '是否确认踢除此会话？', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await userApi.kickSessionBySid(sid);
    message.success('会话已踢下线');
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
.online-monitor-page {
  --panel-max-width: min(1360px, calc(100% - 40px));
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.84), transparent 24%),
    radial-gradient(circle at 88% 10%, rgba(37, 99, 235, 0.08), transparent 18%),
    linear-gradient(180deg, #f6f8fb 0%, #edf2f7 100%);
}

.online-monitor-page :deep(.panel-header) {
  gap: 14px;
}

.online-monitor-page :deep(.data-list) {
  padding-top: 24px;
}

.overview-card {
  --stat-card-padding: 20px;
  --stat-card-radius: 20px;
  --stat-card-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
  --stat-card-hover-shadow: 0 16px 36px rgba(15, 23, 42, 0.11);
  --stat-label-color: #64748b;
  --stat-value-size: 30px;
  --stat-value-weight: 800;
  --stat-value-color: #0f172a;
  --stat-sub-color: #94a3b8;
}

.online-toolbar-shell {
  display: grid;
  gap: 16px;
}

.page-hero,
.filter-panel {
  border-radius: 22px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(10px);
}

.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  padding: 24px 26px;
}

.hero-eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
}

.page-title {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
}

.page-subtitle {
  margin: 10px 0 0;
  max-width: 700px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.toolbar-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.toolbar-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
}

.filter-panel {
  padding: 18px 22px 4px;
}

.online-form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
}

.online-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.online-form :deep(.el-form-item__label) {
  color: #475569;
}

.online-form :deep(.el-input__wrapper),
.online-form :deep(.el-select__wrapper) {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dbe4f0;
  box-shadow: none;
}

.online-form-actions {
  margin-left: auto;
}

.online-form-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 10px;
}

.online-pagination {
  width: 100%;
  display: flex;
  justify-content: flex-end;
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
  background: #2563eb;
}

@media (max-width: 980px) {
  .page-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .online-monitor-page {
    --panel-max-width: calc(100% - 20px);
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .filter-panel {
    padding: 16px 16px 2px;
  }

  .online-form-actions {
    margin-left: 0;
  }

  .online-pagination {
    justify-content: center;
  }
}
</style>
