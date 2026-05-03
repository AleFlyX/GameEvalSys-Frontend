<template>
  <div class="server-dashboard">
    <div class="dashboard-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">服务器配置</p>
          <h1>查看和管理前后端服务以及数据库的关键配置信息</h1>
        </div>
        <el-button class="refresh-btn" plain @click="handleRefresh">刷新</el-button>
      </header>

      <section class="summary-grid">
        <el-card v-for="item in serviceCards" :key="item.title" class="config-card" shadow="never">
          <div class="card-head">
            <div class="card-head-left">
              <div class="service-icon" :style="{ '--icon-accent': item.accent }">{{ item.icon }}</div>
              <div>
                <div class="service-name">{{ item.title }}</div>
                <div class="service-version">{{ item.version }}</div>
              </div>
            </div>
            <el-tag effect="light" size="small" :type="item.tagType">{{ item.tagText }}</el-tag>
          </div>

          <div class="detail-list">
            <div v-for="row in item.rows" :key="row.label" class="detail-row">
              <span class="detail-label">{{ row.label }}</span>
              <span class="detail-value" :class="row.highlight ? 'is-highlight' : ''">{{ row.value }}</span>
            </div>
          </div>

          <template v-if="item.endpoints">
            <el-divider class="card-divider" />
            <div class="endpoint-title">API 路由</div>
            <div class="endpoint-list">
              <div v-for="endpoint in item.endpoints" :key="endpoint.name" class="endpoint-row">
                <span class="endpoint-name">{{ endpoint.name }}</span>
                <span class="endpoint-path">{{ endpoint.path }}</span>
              </div>
            </div>
          </template>
        </el-card>
      </section>

      <section class="system-grid">
        <el-card class="status-card" shadow="never">
          <div class="card-head system-head">
            <div class="card-head-left">
              <div class="service-icon system-icon">∿</div>
              <div>
                <div class="service-name">系统状态</div>
                <div class="service-version">运行 3天 2小时 54分钟</div>
              </div>
            </div>
          </div>

          <div class="usage-grid">
            <div v-for="item in usageStats" :key="item.label" class="usage-item">
              <div class="usage-label">{{ item.label }}</div>
              <div class="usage-value">{{ item.value }}%</div>
              <el-progress :percentage="item.value" :stroke-width="8" :color="item.color" :show-text="false" />
            </div>
          </div>

          <div class="load-row">
            <span class="load-label">负载均衡 (1m / 5m / 15m)</span>
            <span class="load-value">{{ loadAverage.join(' ') }}</span>
          </div>
        </el-card>

        <el-card class="log-card" shadow="never">
          <div class="card-head log-head">
            <div>
              <div class="service-name">最近告警 / 日志</div>
              <div class="service-version">{{ lastRefreshText }}</div>
            </div>
          </div>

          <el-table :data="logList" class="log-table" size="small" :border="false">
            <el-table-column prop="time" label="时间" width="165" />
            <el-table-column prop="level" label="级别" width="90">
              <template #default="scope">
                <el-tag size="small" :type="logTypeMap[scope.row.level] || 'info'" effect="light">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" />
          </el-table>
        </el-card>
      </section>

      <el-card class="ops-card" shadow="never">
        <div class="ops-title">安全运维操作</div>
        <div class="ops-btns">
          <el-button type="primary" icon="Refresh" @click="handleRestart">服务重启</el-button>
          <el-button type="info" icon="Download" @click="handleDownloadLog">下载日志</el-button>
          <el-button type="warning" icon="Document" @click="handleBackup">手动备份</el-button>
          <el-button type="success" icon="Check" @click="handleHealthCheck">健康检查</el-button>
          <el-button type="danger" icon="Close" @click="handleStop">服务下线</el-button>
        </div>
        <div class="ops-tip">* 仅提供安全的运维操作，不支持直接修改敏感配置。</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'ServerMonitorIndex',
});

const lastRefreshText = ref(formatNow());

const serviceCards = [
  {
    title: '前端服务',
    version: 'v2.4.1',
    icon: '◎',
    accent: '#1d7ff2',
    tagText: '生产环境',
    tagType: 'success',
    rows: [
      { label: '端口', value: '3000' },
      { label: 'Base URL', value: 'https://admin.example.com' },
      { label: 'API 超时', value: '30秒' },
      { label: '深色模式', value: '已启用', highlight: true },
    ],
  },
  {
    title: '后端 API 服务',
    version: 'v3.1.0',
    icon: '◌',
    accent: '#1fc76a',
    tagText: '生产环境',
    tagType: 'success',
    rows: [
      { label: '主机', value: 'api.internal.example.com' },
      { label: '端口', value: '8080' },
      { label: '速率限制', value: '1000 请求/分钟' },
      { label: 'CORS 源', value: '2 个域名' },
    ],
    endpoints: [
      { name: 'auth', path: '/api/v1/auth' },
      { name: 'users', path: '/api/v1/users' },
      { name: 'config', path: '/api/v1/config' },
      { name: 'sessions', path: '/api/v1/sessions' },
    ],
  },
  {
    title: 'PostgreSQL',
    version: 'v15.2',
    icon: '⌬',
    accent: '#f0a01a',
    tagText: '稳定运行',
    tagType: 'warning',
    rows: [
      { label: '主机', value: 'db.internal.example.com' },
      { label: '数据库', value: 'admin_panel' },
      { label: '连接池', value: '5 - 20' },
      { label: '自动备份', value: '已启用', highlight: true },
    ],
  },
];

const usageStats = [
  { label: 'CPU 使用', value: 23.5, color: '#4f8fff' },
  { label: '内存使用', value: 61.2, color: '#4f8fff' },
  { label: '磁盘使用', value: 45.8, color: '#4f8fff' },
];

const loadAverage = ['1.20', '0.88', '0.50'];

const logTypeMap = {
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'danger',
};

const logList = ref([
  { time: '2026-04-17 10:00:00', level: 'INFO', content: '服务启动完成' },
  { time: '2026-04-17 10:05:00', level: 'WARN', content: 'CPU使用率高于80%' },
  { time: '2026-04-17 10:10:00', level: 'ERROR', content: '数据库连接超时' },
  { time: '2026-04-17 10:15:00', level: 'INFO', content: '自动备份完成' },
]);

function handleRestart() {
  ElMessage.success('服务重启指令已发送');
}

function handleDownloadLog() {
  ElMessage.info('日志下载任务已发起');
}

function handleBackup() {
  ElMessage.warning('备份任务已发起');
}

function handleHealthCheck() {
  ElMessage.success('健康检查已执行');
}

function handleStop() {
  ElMessage.error('服务下线指令已发送');
}

function handleRefresh() {
  lastRefreshText.value = formatNow();
  ElMessage.success('配置视图已刷新');
}

function formatNow() {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}
</script>

<style scoped>
:global(:root) {
  --dash-bg: #f2f5f9;
  --dash-bg-2: #eef2f6;
  --card-bg: #ffffff;
  --card-border: #e6ebf2;
  --text-main: #1f2933;
  --text-sub: #6b7785;
  --shadow-soft: 0 10px 30px rgba(16, 24, 40, 0.08);
}

.server-dashboard {
  width: 100%;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.7), transparent 28%),
    radial-gradient(circle at 80% 18%, rgba(59, 130, 246, 0.08), transparent 22%),
    linear-gradient(180deg, var(--dash-bg) 0%, var(--dash-bg-2) 100%);
  padding: 28px 18px 40px;
  box-sizing: border-box;
  color: var(--text-main);
}

.dashboard-shell {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.28em;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.15;
  font-weight: 800;
}

.refresh-btn {
  flex-shrink: 0;
  border-color: #d9e2ec;
  color: #344054;
  background: #fff;
  border-radius: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.system-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.config-card,
.status-card,
.log-card,
.ops-card {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-soft);
  color: var(--text-main);
}

.config-card {
  min-height: 296px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.card-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--icon-accent);
  background: color-mix(in srgb, var(--icon-accent) 12%, white);
  border: 1px solid color-mix(in srgb, var(--icon-accent) 22%, white);
}

.service-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.service-version {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-sub);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  font-size: 13px;
}

.detail-label {
  color: #667085;
}

.detail-value {
  text-align: right;
  font-weight: 600;
  color: #101828;
}

.detail-value.is-highlight {
  color: #39d98a;
}

.card-divider {
  margin: 16px 0 12px;
  border-color: #eef2f6;
}

.endpoint-title {
  margin-bottom: 10px;
  font-size: 13px;
  color: #667085;
}

.endpoint-list {
  display: grid;
  gap: 8px;
}

.endpoint-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
}

.endpoint-name {
  min-width: 56px;
  color: #1d7ff2;
  font-weight: 600;
}

.endpoint-path {
  color: #344054;
  text-align: right;
}

.system-head {
  margin-bottom: 18px;
}

.system-icon {
  color: #2563eb;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.usage-item {
  min-width: 0;
}

.usage-label {
  margin-bottom: 6px;
  color: #667085;
  font-size: 12px;
}

.usage-value {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
}

.load-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #eef2f6;
  font-size: 12px;
}

.load-label {
  color: #667085;
}

.load-value {
  font-weight: 700;
}

.log-head {
  margin-bottom: 12px;
}

.log-table {
  --el-table-border-color: #eef2f6;
  --el-table-border: 1px solid #eef2f6;
  --el-table-header-bg-color: #f8fafc;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: #f8fafc;
  --el-table-text-color: #344054;
  --el-table-header-text-color: #667085;
  --el-fill-color-blank: transparent;
  background: transparent;
}

.log-table :deep(th),
.log-table :deep(td) {
  background: transparent !important;
}

.log-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.ops-card {
  padding-top: 4px;
}

.ops-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-main);
  font-size: 16px;
}

.ops-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.ops-tip {
  color: var(--text-sub);
  font-size: 12px;
  margin-top: 6px;
}

@media (max-width: 1100px) {

  .summary-grid,
  .system-grid {
    grid-template-columns: 1fr;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .server-dashboard {
    padding: 18px 12px 24px;
  }

  .page-header {
    flex-direction: column;
  }

  .summary-grid,
  .system-grid {
    grid-template-columns: 1fr;
  }

  .detail-row,
  .endpoint-row,
  .load-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-value,
  .endpoint-path,
  .load-value {
    text-align: left;
  }

  .ops-btns {
    flex-direction: column;
  }
}
</style>
