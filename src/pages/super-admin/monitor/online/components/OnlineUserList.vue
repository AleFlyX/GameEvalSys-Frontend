<template>
  <div v-loading="loading" class="online-list" :class="{ 'is-empty': !list.length && !loading }">
    <div v-if="!loading && !list.length" class="online-empty">
      暂无在线用户
    </div>

    <BaseCard v-else v-for="(row, index) in list" :key="row.id || `${row.username}-${index}`"
      :variant="isDarkMode ? 'default' : 'soft'">

      <div class="online-row">
        <div class="identity-col">
          <div class="user-avatar"
            :class="[row.isEnabled ? 'is-enabled' : 'is-disabled', getStatusTagType(row) === 'danger' ? 'is-offline' : '']">
            <el-icon>
              <component :is="getElementIcon(getDeviceType(row))" />
            </el-icon>
          </div>
          <div class="identity-copy">
            <div class="user-name-line">
              <span class="user-name">{{ row.name || '-' }}</span>
              <el-tag size="small" effect="light" :type="getRoleTagType(row)">{{ getRoleTag(row) }}</el-tag>
            </div>
            <!-- <div class="user-email">{{ formatEmail(row) }}</div> -->
            <div class="user-email">{{ row.username }}</div>
            <div class="user-role">{{ formatRole(row) }}</div>
          </div>
        </div>
        <div class="network-col">
          <MyBtn type="link" class="ip-copy-btn" :title="`点击复制 IP：${formatIp(row)}`" @click="copyIp(row)">
            <span class="primary-text ip-text">{{ formatIp(row) }}</span>
            <span class="ip-copy-hint">复制</span>
          </MyBtn>
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
          <div class="status-sub">活跃会话数 {{ row.onlineCount ?? 0 }}</div>
        </div>
        <div class="actions-col">
          <el-button link type="primary" class="row-action-btn" @click="emitOpenSessions(row)">
            <el-icon>
              <component :is="getElementIcon('Search')" />
            </el-icon>
          </el-button>
          <el-button link type="danger" class="row-action-btn" @click="emitKickAll(row)">
            <el-icon>
              <component :is="getElementIcon('SwitchButton')" />
            </el-icon>
          </el-button>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { getElementIcon } from '@/utils/elementIcons';
import { formatTime } from '@/utils/format';
import { useTheme } from '@/composables/useTheme';
import { useMessage } from '@/composables/useMessage';
const { isDarkMode } = useTheme();
const message = useMessage();
defineOptions({
  name: 'OnlineUserList',
});

defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['open-sessions', 'kick-all']);

function emitOpenSessions(row) {
  emit('open-sessions', row);
}

function emitKickAll(row) {
  emit('kick-all', row);
}

async function copyIp(row) {
  const ip = `${formatIp(row)}`.trim();
  if (!ip || ip === '-') {
    message.warning('当前没有可复制的 IP');
    return;
  }

  try {
    await navigator.clipboard.writeText(ip);
    message.success('IP 已复制');
  } catch {
    const input = document.createElement('input');
    input.value = ip;
    input.setAttribute('readonly', 'readonly');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(input);

    if (copied) {
      message.success('IP 已复制');
    } else {
      message.error('复制失败，请手动复制');
    }
  }
}

// function formatEmail(row) {
//   if (row?.email) return row.email;
//   if (row?.username) return `${row.username}@company.com`;
//   return '-';
// }

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
  return row?.ip || '-';
}

function formatLocation(row) {
  return row?.loginLocation || '-';
}

function formatLastLogin(row) {
  return formatTime(row.lastLoginAt, 'YYYY-MM-DD HH:mm:ss');
}

function formatLastActive(row) {
  if (row?.lastActiveAt) return formatTime(row.lastActiveAt, 'YYYY-MM-DD HH:mm:ss');
  return '-';
}

function getDeviceType(row) {
  const device = `${row?.device || ''}`.toLowerCase();
  return device.includes('mobile') || device.includes('phone') || device.includes('android') || device.includes('ios')
    ? 'Cellphone'
    : 'Monitor';
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
    super_admin: 'primary',
    admin: 'primary',
    scorer: 'success',
    normal: 'info',
  };
  return roleMap[row?.role] || 'info';
}

function getStatusTagType(row) {
  if (row?.isEnabled === false) return 'danger';
  if (Number(row?.onlineCount || 0) > 0) return 'success';
  return 'warning';
}

function getStatusLabel(row) {
  if (row?.isEnabled === false) return '禁用';
  if (Number(row?.onlineCount || 0) > 0) return '在线';
  return '离线';
}
</script>

<style scoped>
.online-list {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e6ebf2;
  /* background: #ffffff; */
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
}

.online-row:last-child {
  border-bottom: none;
}

.identity-col {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.network-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  color: var(--text-secondary);
  font-size: 22px;
}

.user-avatar.is-enabled {
  background: rgba(34, 197, 94, 0.14);
}

.user-avatar.is-disabled,
.user-avatar.is-offline {
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
  color: var(--text);
  font-size: 13px;
}

.primary-text {
  color: var(--text);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.15;
}

.ip-copy-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  appearance: none;
  -webkit-appearance: none;
  text-align: left;
  cursor: pointer;
}

.ip-copy-btn:hover .ip-text,
.ip-copy-btn:focus-visible .ip-text {
  color: #2563eb;
}

.ip-copy-btn:hover .ip-copy-hint,
.ip-copy-btn:focus-visible .ip-copy-hint {
  opacity: 1;
  transform: translateY(-1px);
}

.ip-copy-btn:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.22);
  outline-offset: 4px;
  border-radius: 8px;
}

.ip-text {
  flex: 1;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ip-copy-hint {
  flex: none;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  opacity: 0.72;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.secondary-text {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.status-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.status-sub {
  color: var(--text-secondary);
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
  color: var(--text-secondary);
}

.row-action-btn:hover {
  background: #f2f4f7;
}

.row-action-btn :deep(.el-icon) {
  font-size: 18px;
}

@media (max-width: 1200px) {
  .online-row {
    grid-template-columns: minmax(220px, 1.7fr) minmax(130px, 1fr) minmax(130px, 0.9fr) minmax(130px, 0.9fr) 110px 84px;
    padding: 22px 20px;
  }
}

@media (max-width: 980px) {
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
}
</style>
