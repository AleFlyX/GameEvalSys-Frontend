<template>
  <div class="online-panel">
    <base-card shadow="hover" class="online-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="70px" class="online-form">
        <el-form-item label="关键词" prop="keyWords">
          <el-input v-model="queryParams.keyWords" placeholder="用户名/姓名关键词" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="queryParams.role" placeholder="全部角色" clearable style="width: 100px;">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="打分用户" value="scorer" />
            <el-option label="普通用户" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="isEnabled">
          <el-select v-model="queryParams.isEnabled" placeholder="全部" clearable style="width: 90px;">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="在线" prop="onlineOnly">
          <el-switch v-model="queryParams.onlineOnly" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="onlineList" style="width: 100%" border
        :empty-text="loading ? '加载中...' : '暂无在线用户'" class="online-table">
        <el-table-column label="序号" width="60" align="center" type="index">
          <template #default="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户ID" align="center" prop="id" width="88" />
        <el-table-column label="登录名称" align="center" prop="username" :show-overflow-tooltip="true" />
        <el-table-column label="姓名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="角色" align="center" prop="role" width="120" />
        <el-table-column label="启用状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isEnabled ? 'success' : 'info'">
              {{ scope.row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="在线会话数" align="center" prop="onlineCount" width="110" />
        <el-table-column label="最近活跃时间" align="center" prop="lastActiveAt" width="180" />
        <el-table-column label="最近登录时间" align="center" prop="lastLoginAt" width="180" />
        <el-table-column label="操作" align="center" width="220">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleOpenSessions(scope.row)">会话详情</el-button>
            <el-button link type="danger" icon="Delete" size="small" @click="handleKickAll(scope.row)">踢下线</el-button>
          </template>
        </el-table-column>
      </el-table>

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
  role: '',
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
  queryParams.value.role = '';
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
  background: #f6f8fa;
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
  padding: 24px 32px 32px 32px;
  box-sizing: border-box;
}

.online-form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.online-table {
  margin-bottom: 18px;
}

.online-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.session-dialog-header {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  color: #606266;
}
</style>
