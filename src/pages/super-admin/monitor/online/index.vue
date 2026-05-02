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

      <div v-loading="loading" class="online-list" :class="{ 'is-empty': !onlineList.length && !loading }">
        <div v-if="!loading && !onlineList.length" class="online-empty">
          暂无在线用户
        </div>

        <div v-for="(row, index) in onlineList" :key="row.id || `${row.username}-${index}`" class="online-row">
          <div class="identity-col">
            <div class="user-avatar" :class="row.isEnabled ? 'is-enabled' : 'is-disabled'">
              <el-icon>
                <component :is="getElementIcon(getDeviceType(row) === 'desktop' ? 'Monitor' : 'Cellphone')" />
              </el-icon>
            </div>
            <div class="identity-copy">
              <div class="user-name-line">
                <span class="user-name">{{ row.username || '-' }}</span>
                <el-tag size="small" effect="light" :type="getRoleTagType(row)">{{ getRoleTag(row) }}</el-tag>
              </div>
              <div class="user-email">{{ formatEmail(row) }}</div>
              <div class="user-role">{{ formatRole(row) }}</div>
            </div>
          </div>

          <div class="network-col">
            <div class="primary-text">{{ formatIp(row) }}</div>
            <div class="secondary-text">{{ formatLocation(row) }}</div>
          </div>

          <div class="time-col">
            <div class="primary-text">{{ formatLastLogin(row) }}</div>
            <div class="secondary-text">登录时间</div>
          </div>

          <div class="time-col">
            <div class="primary-text">{{ formatLastActive(row) }}</div>
            <div class="secondary-text">最近活跃</div>
          </div>

          <div class="status-col">
            <el-tag size="large" round effect="light" :type="getStatusTagType(row)">{{ getStatusLabel(row) }}</el-tag>
            <div class="status-sub">会话数 {{ row.onlineCount ?? 0 }}</div>
          </div>

          <div class="actions-col">
            <el-button link type="primary" class="row-action-btn" @click="handleOpenSessions(row)">
              <el-icon>
                <component :is="getElementIcon('Search')" />
              </el-icon>
            </el-button>
            <el-button link type="danger" class="row-action-btn" @click="handleKickAll(row)">
              <el-icon>
                <component :is="getElementIcon('SwitchButton')" />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div class="online-pagination">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next, sizes" :page-sizes="[10, 20, 50, 100]" background
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </base-card>

    <base-dialog-modal v-model:visible="sessionDialogVisible" title="用户会话详情" width="900px">
      <template #header>
        <div class="session-dialog-header">
          <span>用户：{{ currentSessionUser.username || '-' }}</span>
          <span>姓名：{{ currentSessionUser.name || '-' }}</span>
        </div>
      </template>
      <template #body>
        <el-table v-loading="sessionLoading" :data="sessionList" border style="width: 100%;" empty-text="暂无会话">
          <el-table-column label="SID" prop="sid" min-width="230" :show-overflow-tooltip="true" />
          <el-table-column label="状态" prop="status" width="110" align="center" />
          <el-table-column label="登录时间" prop="loginAt" width="180" align="center" />
          <el-table-column label="最近活跃" prop="lastActiveAt" width="180" align="center" />
          <el-table-column label="操作" width="110" align="center">
            <template #default="scope">
              <el-button link type="danger" size="small" :disabled="scope.row.status !== 'active'"
                @click="handleKickSession(scope.row)">
                强退
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </base-dialog-modal>
  </div>
</template>

<script setup>
import BaseCard from '@/components/common/data/BaseCard.vue';
import { ref, onMounted } from 'vue';
import { userApi } from '@/api/user';
import { showMsgBox } from '@/utils/ConfirmBox';
import { useMessage } from '@/composables/useMessage';
import BaseDialogModal from '@/components/common/modal/BaseDialogModal.vue';
import { getElementIcon } from '@/utils/elementIcons';
defineOptions({
  name: 'OnlineMonitorIndex',
});

const message = useMessage();

const queryRef = ref(null)
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

function formatEmail(row) {
  if (row?.email) return row.email;
  if (row?.username) return `${row.username}@company.com`;
  return '-';
}

function formatRole(row) {
  const roleMap = {
    super_admin: '超级管理员',
    admin: '管理员',
    scorer: '打分用户',
    normal: '普通用户',
  };
  return roleMap[row?.role] || row?.role || '-';
}

function formatIp(row) {
  return row?.loginIp || row?.ip || row?.clientIp || '-';
}

function formatLocation(row) {
  return row?.location || row?.city || row?.region || '-';
}

function formatLastLogin(row) {
  return row?.lastLoginAt || row?.loginAt || '-';
}

function formatLastActive(row) {
  if (row?.lastActiveText) return row.lastActiveText;
  if (row?.idleText) return row.idleText;
  if (row?.lastActiveAt) return row.lastActiveAt;
  return '-';
}

function getDeviceType(row) {
  const device = `${row?.deviceType || row?.clientType || row?.platform || ''}`.toLowerCase();
  return device.includes('mobile') || device.includes('phone') || device.includes('android') || device.includes('ios')
    ? 'mobile'
    : 'desktop';
}

function getRoleTag(row) {
  const roleMap = {
    super_admin: '超级管理员',
    admin: '管理员',
    scorer: '打分用户',
    normal: '普通用户',
  };
  return roleMap[row?.role] || row?.role || '-';
}

function getRoleTagType(row) {
  const roleMap = {
    super_admin: 'success',
    admin: 'primary',
    scorer: 'warning',
    normal: 'info',
  };
  return roleMap[row?.role] || 'info';
}

function getStatusTagType(row) {
  if (row?.isEnabled === false) return 'info';
  if (Number(row?.onlineCount || 0) > 0) return 'success';
  return 'warning';
}
function getStatusLabel(row) {
  if (row?.isEnabled === false) return '禁用';
  if (Number(row?.onlineCount || 0) > 0) return '在线';
  return '离线';
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

.online-list {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e6ebf2;
  background: #ffffff;
}

.online-list.is-empty {
  min-height: 220px;
}

.online-empty {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667085;
}

.online-row {
  display: grid;
  grid-template-columns: minmax(260px, 1.6fr) minmax(140px, 0.9fr) minmax(150px, 0.95fr) minmax(150px, 0.95fr) 120px 92px;
  align-items: center;
  gap: 12px;
  padding: 26px 28px;
  border-bottom: 1px solid #eef2f6;
}

.online-row:last-child {
  border-bottom: none;
}

.online-row:hover {
  background: #fbfcfe;
}

.identity-col {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f2f4f7;
  color: #344054;
  font-size: 22px;
}

.user-avatar.is-enabled {
  background: rgba(34, 197, 94, 0.14);
}

.user-avatar.is-disabled {
  background: rgba(245, 158, 11, 0.14);
}

.identity-copy {
  min-width: 0;
}

.user-name-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.user-name {
  color: #101828;
  font-size: 18px;
  font-weight: 800;
}

.user-email {
  color: #667085;
  font-size: 14px;
  margin-bottom: 6px;
}

.user-role {
  color: #98a2b3;
  font-size: 13px;
}

.primary-text {
  color: #101828;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.15;
}

.secondary-text {
  margin-top: 8px;
  color: #667085;
  font-size: 13px;
}

.status-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.status-sub {
  color: #667085;
  font-size: 12px;
}

.actions-col {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-left: 12px;
}

.row-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  color: #667085;
}

.row-action-btn:hover {
  background: #f2f4f7;
}

.row-action-btn :deep(.el-icon) {
  font-size: 18px;
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

.session-dialog-header {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  color: #606266;
}

@media (max-width: 1200px) {
  .online-row {
    grid-template-columns: minmax(220px, 1.7fr) minmax(130px, 1fr) minmax(130px, 0.9fr) minmax(130px, 0.9fr) 110px 84px;
    padding: 22px 20px;
  }
}

@media (max-width: 980px) {
  .online-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .online-form {
    gap: 10px 0;
  }

  .online-row {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 18px 16px;
  }

  .identity-col,
  .status-col,
  .actions-col {
    justify-content: flex-start;
  }

  .status-col {
    align-items: flex-start;
  }

  .actions-col {
    padding-left: 0;
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

  .identity-col {
    gap: 12px;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .user-name {
    font-size: 16px;
  }

  .primary-text {
    font-size: 16px;
  }

  .online-pagination {
    justify-content: center;
  }
}
</style>
