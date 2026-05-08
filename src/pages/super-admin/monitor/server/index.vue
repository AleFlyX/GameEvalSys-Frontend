<template>
  <div class="monitor-page">
    <div class="monitor-shell">
      <header class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">服务器监控</p>
          <h1>GameEvalSys-Monitor</h1>
          <p class="hero-desc">
            聚焦总览、健康态、资源使用和配置摘要
          </p>
          <div class="hero-meta">
            <el-tag :type="statusMeta.type" effect="light" size="small">
              {{ statusMeta.text }}
            </el-tag>
            <span>{{ dashboard.summary.message }}</span>
            <span class="meta-dot">·</span>
            <span>接口更新时间 {{ dashboard.summary.updatedAt }}</span>
            <span class="meta-dot">·</span>
            <span>页面刷新 {{ lastRefreshText }}</span>
          </div>
        </div>

        <div class="hero-actions">
          <el-button type="primary" :loading="loading" class="refresh-btn" @click="handleRefresh">
            刷新数据
          </el-button>
          <div class="hero-state">
            <span class="state-dot" :class="statusMeta.className"></span>
            <span>{{ transportText }}</span>
            <span class="state-dot state-dot--small" :class="connectionMeta.className"></span>
            <span>{{ connectionMeta.text }}</span>
          </div>
        </div>
      </header>

      <section class="stat-grid">
        <StatCard v-for="item in summaryCards" :key="item.label" class="metric-card" :label="item.label"
          :value="item.value" :sub="item.sub" label-placement="body" :icon="item.icon" :icon-color="item.iconColor"
          :icon-bg="item.iconBg" :icon-size="42" :icon-radius="14" />
      </section>

      <section class="content-grid">
        <div class="left-column">
          <BaseCard class="panel-card" shadow="never">
            <div class="panel-head">
              <div>
                <div class="panel-title">健康总览</div>
                <div class="panel-subtitle">服务状态、数据库和缓存状态</div>
              </div>
              <el-tag effect="light" :type="statusMeta.type">
                {{ dashboard.application.port ? `PORT ${dashboard.application.port}` : 'PORT --' }}
              </el-tag>
            </div>

            <div class="health-list">
              <div v-for="item in healthItems" :key="item.name" class="health-item">
                <div class="health-item-left">
                  <div class="health-icon" :style="{ '--item-color': item.color }">
                    {{ item.shortName }}
                  </div>
                  <div>
                    <div class="health-name">{{ item.name }}</div>
                    <div class="health-desc">{{ item.detail }}</div>
                  </div>
                </div>
                <el-tag :type="item.tagType" effect="light" size="small">
                  {{ item.statusText }}
                </el-tag>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="panel-card" shadow="never">
            <div class="panel-head">
              <div>
                <div class="panel-title">资源趋势</div>
                <div class="panel-subtitle">最近一段时间的 CPU、内存和磁盘变化</div>
              </div>
            </div>

            <div class="metric-list">
              <div v-for="item in resourceItems" :key="item.label" class="metric-row">
                <div class="metric-row-head">
                  <div>
                    <div class="metric-label">{{ item.label }}</div>
                    <div class="metric-note">{{ item.note }}</div>
                  </div>
                  <div class="metric-value">{{ item.value }}%</div>
                </div>

                <el-progress :percentage="item.value" :stroke-width="8" :color="item.color" :show-text="false" />

                <div class="sparkline">
                  <span v-for="(point, index) in item.trend" :key="`${item.label}-${index}`" class="spark-bar"
                    :style="{ height: `${Math.max(point, 10)}%`, backgroundColor: item.color }" />
                </div>
              </div>
            </div>

            <div class="load-row">
              <span class="load-label">负载均值 (1m / 5m / 15m)</span>
              <span class="load-value">{{ dashboard.loadAverage.join(' / ') }}</span>
            </div>
          </BaseCard>

          <BaseCard class="panel-card" shadow="never">
            <div class="panel-head">
              <div>
                <div class="panel-title">JVM 运行态</div>
                <div class="panel-subtitle">堆内存、提交内存、最大内存与线程数</div>
              </div>
            </div>

            <div class="jvm-grid">
              <div v-for="item in jvmItems" :key="item.label" class="jvm-item">
                <div class="jvm-item-head">
                  <span class="jvm-label">{{ item.label }}</span>
                  <span class="jvm-value">{{ item.value }}</span>
                </div>
                <div class="jvm-desc">{{ item.desc }}</div>
                <el-progress v-if="typeof item.percentage === 'number'" :percentage="item.percentage" :stroke-width="7"
                  :color="item.color" :show-text="false" />
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="right-column">
          <BaseCard class="panel-card" shadow="never">
            <div class="panel-head">
              <div>
                <div class="panel-title">运行摘要</div>
                <div class="panel-subtitle">主机、应用与数据库的最小必要信息</div>
              </div>
            </div>

            <div class="summary-block">
              <div class="summary-item">
                <span class="summary-label">主机</span>
                <span class="summary-value">{{ dashboard.server.hostName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">IP 地址</span>
                <span class="summary-value">{{ dashboard.server.ip }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">系统</span>
                <span class="summary-value">{{ dashboard.server.os }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">运行时长</span>
                <span class="summary-value">{{ dashboard.application.runtime }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">应用版本</span>
                <span class="summary-value">{{ dashboard.application.version }}</span>
              </div>
              <!-- <div class="summary-item">
                <span class="summary-label">数据库延迟</span>
                <span class="summary-value">{{ dashboard.database.latencyMs }} ms</span>
              </div> -->
            </div>
          </BaseCard>

          <BaseCard class="panel-card" shadow="never">
            <div class="panel-head">
              <div>
                <div class="panel-title">配置摘要</div>
                <div class="panel-subtitle">只展示脱敏后的关键信息，不回显敏感配置</div>
              </div>
            </div>

            <div class="config-list">
              <div v-for="item in configItems" :key="item.label" class="config-row">
                <span class="config-label">{{ item.label }}</span>
                <span class="config-value">{{ item.value }}</span>
              </div>
            </div>
          </BaseCard>

          <BaseCard class="panel-card" shadow="never">
            <div class="panel-head">
              <div>
                <div class="panel-title">最近告警 / 日志</div>
                <div class="panel-subtitle">{{ dashboard.logs.length }} 条最新记录</div>
              </div>
            </div>

            <div class="log-list">
              <div v-for="log in dashboard.logs" :key="`${log.time}-${log.content}`" class="log-item">
                <div class="log-item-head">
                  <span class="log-time">{{ log.time }}</span>
                  <el-tag size="small" effect="light" :type="logTypeMap[log.level] || 'info'">
                    {{ log.level }}
                  </el-tag>
                </div>
                <div class="log-content">{{ log.content }}</div>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import BaseCard from '@/components/common/data/BaseCard.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import { monitorApi } from '@/api/monitor';

defineOptions({
  name: 'ServerMonitorIndex',
});

const POLL_INTERVAL = 15000;
const RECONNECT_DELAY = 5000;
const MAX_STREAM_RETRY = 3;

const loading = ref(false);
const lastRefreshText = ref(formatNow());
const connectionStatus = ref('connecting');
const realtimeMode = ref('idle');
const retryCount = ref(0);
const pollTick = ref(0);

let streamSource = null;
let pollTimer = null;
let reconnectTimer = null;

const logTypeMap = {
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'danger',
};

function normalizeStatus(value, fallback = 'UP') {
  const raw = String(value || fallback).trim().toLowerCase();
  if (['up', 'ok', 'running', 'online', 'healthy', 'success'].includes(raw)) {
    return 'UP';
  }
  if (['warn', 'warning', 'degraded', 'partial'].includes(raw)) {
    return 'WARN';
  }
  if (['down', 'error', 'fail', 'failed', 'offline', 'unhealthy'].includes(raw)) {
    return 'DOWN';
  }
  return fallback;
}

function normalizeLoadAverage(raw) {
  if (!Array.isArray(raw) || raw.length < 3) {
    return ['0.00', '0.00', '0.00'];
  }
  return raw.slice(0, 3).map((item) => String(item));
}

function formatUptime(seconds) {
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0 分钟';
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];

  if (days > 0) parts.push(`${days}天`);
  if (hours > 0 || parts.length) parts.push(`${hours}小时`);
  parts.push(`${minutes}分钟`);

  return parts.join(' ');
}

function toPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }
  if (num > 0 && num <= 1) {
    return Number((num * 100).toFixed(1));
  }
  return Number(num.toFixed(1));
}

/**
 * 赛选出第一个有效值，依次判断每个参数，直到找到一个非 undefined、非 null、非空字符串的值并返回它。如果所有参数都无效，则返回 undefined。
 * @param values
 */
function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function normalizeText(value, fallback = '') {
  const next = pickFirst(value, fallback);
  return next === undefined ? fallback : String(next);
}

function formatOsLabel(osName, osVersion, osArch, fallback = '') {
  const name = normalizeText(osName, '');
  const version = normalizeText(osVersion, '');
  const arch = normalizeText(osArch, '');
  const base = [name, version].filter(Boolean).join(' ').trim();

  if (base && arch) {
    return `${base} (${arch})`;
  }
  if (base) {
    return base;
  }
  if (arch) {
    return arch;
  }
  return fallback;
}

function normalizeOsLabel(raw, fallback = '') {
  if (raw && typeof raw === 'object') {
    return formatOsLabel(raw.osName, raw.osVersion, raw.osArch, fallback);
  }
  return normalizeText(raw, fallback);
}

function normalizeBytes(value, fallback = 0) {
  const num = Number(pickFirst(value, fallback) ?? fallback);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeJvmPayload(raw = {}) {
  return {
    heapUsedBytes: normalizeBytes(
      pickFirst(raw.heapUsedBytes, raw.usedHeapBytes, raw.heap?.used, raw.memory?.heapUsedBytes),
      0,
    ),
    heapCommittedBytes: normalizeBytes(
      pickFirst(raw.heapCommittedBytes, raw.committedHeapBytes, raw.heap?.committed, raw.memory?.heapCommittedBytes),
      0,
    ),
    heapMaxBytes: normalizeBytes(
      pickFirst(raw.heapMaxBytes, raw.maxHeapBytes, raw.heap?.max, raw.memory?.heapMaxBytes),
      0,
    ),
    threadCount: Number(pickFirst(raw.threadCount, raw.threads, raw.liveThreads, 0)) || 0,
  };
}

function createMockDashboard() {
  return {
    summary: {
      status: 'UP',
      message: '核心服务运行稳定',
      updatedAt: formatNow(),
      source: 'local',
    },
    application: {
      name: '课题项目打分系统',
      version: 'v1.0.0',
      port: 8080,
      startTime: '2026-05-08 09:20:00',
      runtime: '3天 2小时 54分钟',
    },
    server: {
      hostName: 'score-admin-01',
      ip: '192.168.10.24',
      os: 'Ubuntu 22.04 LTS',
      cpuCores: 8,
    },
    database: {
      type: 'MySQL',
      host: 'db.internal.example.com',
      port: 3306,
      database: 'score_platform',
      status: 'UP',
      latencyMs: 12,
    },
    redis: {
      host: 'redis.internal.example.com',
      port: 6379,
      database: 0,
      status: 'UP',
      latencyMs: 3,
    },
    jvm: {
      heapUsedBytes: 268435456,
      heapCommittedBytes: 536870912,
      heapMaxBytes: 805306368,
      threadCount: 64,
    },
    health: {
      overallStatus: 'UP',
      datasourceStatus: 'UP',
      redisStatus: 'UP',
      message: '数据库和 Redis 均正常',
    },
    metrics: {
      cpu: [18, 22, 20, 24, 23, 21, 26, 28],
      memory: [52, 54, 56, 59, 60, 61, 62, 61],
      disk: [44, 44, 45, 45, 46, 46, 46, 46],
    },
    loadAverage: ['1.20', '0.88', '0.50'],
    config: [
      { label: 'server.port', value: '8080' },
      { label: '时区', value: 'Asia/Shanghai' },
      { label: '数据库', value: 'score_platform@db.internal.example.com:3306' },
      { label: 'Redis', value: 'redis.internal.example.com:6379 / DB 0' },
      { label: 'cacheSchedulerEnabled', value: 'true' },
    ],
    logs: [
      // { time: '2026-05-08 10:00:00', level: 'INFO', content: '服务启动完成' },
      // { time: '2026-05-08 10:05:00', level: 'WARN', content: 'CPU 使用率短暂高于 80%' },
      // { time: '2026-05-08 10:10:00', level: 'ERROR', content: '数据库连接超时，已自动重试' },
      // { time: '2026-05-08 10:15:00', level: 'INFO', content: '自动备份执行完成' },
    ],
  };
}

const dashboard = ref(createMockDashboard());

const statusMeta = computed(() => {
  const status = dashboard.value.summary.status || dashboard.value.health?.overallStatus || 'UP';
  if (status === 'DOWN') {
    return { text: '告警', type: 'danger', className: 'is-danger' };
  }
  if (status === 'WARN') {
    return { text: '注意', type: 'warning', className: 'is-warning' };
  }
  return { text: '正常', type: 'success', className: 'is-success' };
});

const connectionMeta = computed(() => {
  if (realtimeMode.value === 'sse') {
    return { text: 'SSE 实时刷新', className: 'is-success' };
  }

  if (realtimeMode.value === 'polling') {
    return { text: `轮询兜底 · ${Math.round(POLL_INTERVAL / 1000)} 秒`, className: 'is-warning' };
  }

  if (connectionStatus.value === 'reconnecting') {
    return { text: 'SSE 重连中', className: 'is-warning' };
  }

  if (connectionStatus.value === 'fallback') {
    return { text: '轮询兜底中', className: 'is-warning' };
  }

  if (connectionStatus.value === 'open') {
    return { text: 'SSE 已连接', className: 'is-success' };
  }

  return { text: '正在建立 SSE 连接', className: 'is-warning' };
});

const transportText = computed(() => {
  if (dashboard.value.summary.source !== 'remote') {
    return '本地示例数据';
  }

  if (realtimeMode.value === 'sse') {
    return '已连接后端监控接口';
  }

  if (realtimeMode.value === 'polling') {
    return '后端接口 · 轮询刷新';
  }

  return '后端接口已加载';
});

const summaryCards = computed(() => [
  {
    label: '总体健康',
    value: statusMeta.value.text,
    sub: dashboard.value.summary.message,
    icon: 'Checked',
    iconColor: '#2563eb',
    iconBg: '#eaf2ff',
  },
  {
    label: '运行时长',
    value: dashboard.value.application.runtime,
    sub: `${dashboard.value.application.name} · ${dashboard.value.application.version}`,
    icon: 'Clock',
    iconColor: '#0f766e',
    iconBg: '#dff7f4',
  },
  {
    label: 'CPU 使用',
    value: `${getMetricValue('cpu')}%`,
    sub: `CPU 核心数 ${dashboard.value.server.cpuCores}`,
    icon: 'TrendCharts',
    iconColor: '#ea580c',
    iconBg: '#fff1e6',
  },
  {
    label: 'JVM 堆',
    value: `${getJvmHeapUsagePercent()}%`,
    sub: `线程数 ${dashboard.value.jvm.threadCount}`,
    icon: 'DataAnalysis',
    iconColor: '#7c3aed',
    iconBg: '#f3ebff',
  },
]);

const healthItems = computed(() => [
  {
    name: '应用服务',
    shortName: 'AP',
    detail: `端口 ${dashboard.value.application.port} · 启动于 ${dashboard.value.application.startTime}`,
    statusText: statusMeta.value.text,
    tagType: statusMeta.value.type,
    color: '#2563eb',
  },
  {
    name: '数据源',
    shortName: 'DB',
    detail: `${dashboard.value.database.type} · ${dashboard.value.database.host}:${dashboard.value.database.port} / ${dashboard.value.database.database}`,
    statusText: dashboard.value.health?.datasourceStatus === 'UP' ? '正常' : '异常',
    tagType: dashboard.value.health?.datasourceStatus === 'UP' ? 'success' : 'danger',
    color: '#ea580c',
  },
  {
    name: 'Redis',
    shortName: 'RD',
    detail: `${dashboard.value.redis.host}:${dashboard.value.redis.port} · DB ${dashboard.value.redis.database}`,
    statusText: dashboard.value.redis.status === 'UP' ? '正常' : '异常',
    tagType: dashboard.value.redis.status === 'UP' ? 'success' : 'danger',
    color: '#7c3aed',
  },
  {
    name: '主机资源',
    shortName: 'OS',
    detail: `${dashboard.value.server.os} · ${dashboard.value.server.cpuCores} 核`,
    statusText: dashboard.value.health?.overallStatus === 'UP' ? '正常' : '关注',
    tagType: dashboard.value.health?.overallStatus === 'UP' ? 'success' : 'warning',
    color: '#0f766e',
  },
]);

const resourceItems = computed(() => [
  {
    label: 'CPU 使用',
    value: getMetricValue('cpu'),
    note: '近 8 个采样点',
    color: '#2563eb',
    trend: dashboard.value.metrics.cpu,
  },
  {
    label: '内存使用',
    value: getMetricValue('memory'),
    note: '堆外与系统内存合并展示',
    color: '#7c3aed',
    trend: dashboard.value.metrics.memory,
  },
  {
    label: '磁盘使用',
    value: getMetricValue('disk'),
    note: '整体磁盘占用情况',
    color: '#ea580c',
    trend: dashboard.value.metrics.disk,
  },
]);

const jvmItems = computed(() => [
  {
    label: '堆已用',
    value: formatBytes(dashboard.value.jvm.heapUsedBytes),
    desc: `占比 ${getJvmHeapUsagePercent()}%`,
    percentage: getJvmHeapUsagePercent(),
    color: '#7c3aed',
  },
  {
    label: '堆提交',
    value: formatBytes(dashboard.value.jvm.heapCommittedBytes),
    desc: `最大 ${formatBytes(dashboard.value.jvm.heapMaxBytes)}`,
  },
  {
    label: '线程数',
    value: String(dashboard.value.jvm.threadCount),
    desc: '当前活动线程总数',
  },
]);

const configItems = computed(() => dashboard.value.config);

function getMetricValue(key) {
  const series = dashboard.value.metrics[key] || [];
  const last = series[series.length - 1];
  return Number.isFinite(last) ? Number(last).toFixed(1) : '0.0';
}

function getJvmHeapUsagePercent() {
  const max = Number(dashboard.value.jvm.heapMaxBytes || 0);
  const used = Number(dashboard.value.jvm.heapUsedBytes || 0);

  if (!max) {
    return 0;
  }

  return Number(((used / max) * 100).toFixed(1));
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  return `${size >= 100 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
}

function unwrapApiPayload(response) {
  const body = response?.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data ?? {};
  }
  return body ?? {};
}

function createMetricTrend(value) {
  const series = dashboard.value.metrics[value] || [];
  return Array.isArray(series) ? [...series] : [];
}

function pushTrend(series, value) {
  const next = Array.isArray(series) ? [...series] : [];
  if (!Number.isFinite(value)) {
    return next;
  }
  next.push(Number(value.toFixed(1)));
  while (next.length > 8) {
    next.shift();
  }
  return next;
}

/**
 * 通过数据库驱动类名推断数据库类型，常见的 JDBC 驱动类名格式为 com.vendor.db.Driver，
 * 例如 com.mysql.cj.jdbc.Driver、org.postgresql.Driver、oracle.jdbc.OracleDriver 等。
 * 函数会提取出 vendor.db 部分，并将首字母大写作为数据库类型返回。如果无法解析，则返回原始字符串。
 * @param driveName
 */
function handleDBDriveToDBType(driveName = "") {
  if (driveName.indexOf(".") === -1) {
    return driveName;
  }

  const startIdx = driveName.indexOf(".") + 1;
  driveName = driveName.slice(startIdx);

  const endIdx = driveName.indexOf(".");
  driveName = driveName.slice(0, endIdx);

  driveName = driveName[0].toUpperCase() + driveName.slice(1);
  return driveName;
}

function normalizeDashboard(raw = {}) {
  console.log('原始监控数据', raw);
  const payload = raw && typeof raw === 'object' ? raw : {};
  console.log('解析后的监控数据', payload.config.datasourceDatabase);
  const base = createMockDashboard();
  const overview = payload.overview || payload.app || payload.application || {};
  const health = payload.health || {};
  const datasource = payload.config || {};
  const redis = payload.redis || {};
  const jvm = payload.jvm || {};
  const os = payload.os || {};
  const config = payload.config || {};
  const logs = payload.logs || [];

  return {
    summary: {
      ...base.summary,
      status: normalizeStatus(
        pickFirst(health.overallStatus, payload.overallStatus, payload.status, overview.status, base.summary.status),
        base.summary.status,
      ),
      message: normalizeText(
        pickFirst(health.message, payload.message, overview.message),
        base.summary.message,
      ),
      updatedAt: normalizeText(pickFirst(payload.updatedAt, overview.updatedAt, health.updatedAt), formatNow()),
      source: 'remote',
    },
    application: {
      ...base.application,
      name: normalizeText(
        pickFirst(overview.name, overview.serviceName, overview.appName, payload.name),
        base.application.name,
      ),
      version: normalizeText(
        pickFirst(overview.appVersion, overview.version, payload.version, payload.appVersion),
        base.application.version,
      ),
      port: Number(pickFirst(overview.port, overview.serverPort, payload.port, base.application.port)) || base.application.port,
      startTime: normalizeText(
        pickFirst(overview.startTime, overview.startedAt, payload.startTime),
        base.application.startTime,
      ),
      runtime: normalizeText(
        pickFirst(overview.runtime, overview.uptimeText, formatUptime(overview.uptimeSeconds), payload.runtime),
        base.application.runtime,
      ),
    },
    server: {
      ...base.server,
      hostName: normalizeText(pickFirst(overview.hostName, os.hostName, payload.hostName), base.server.hostName),
      ip: normalizeText(pickFirst(overview.hostAddress, overview.ip, os.ip, payload.ip), base.server.ip),
      os: normalizeOsLabel({
        osName: pickFirst(os.osName, overview.osName, payload.osName, os.os, overview.os, payload.os),
        osVersion: pickFirst(os.osVersion, overview.osVersion, payload.osVersion),
        osArch: pickFirst(os.osArch, overview.osArch, payload.osArch),
      }, base.server.os),
      cpuCores: Number(pickFirst(os.availableProcessors, os.cpuCores, overview.cpuCores, payload.cpuCores, base.server.cpuCores)) || base.server.cpuCores,
    },
    database: {
      ...base.database,
      type: normalizeText(pickFirst(handleDBDriveToDBType(datasource.datasourceDriverClassName), payload.databaseType), base.database.type),
      host: normalizeText(pickFirst(datasource.datasourceHost, payload.databaseHost), base.database.host),
      port: Number(pickFirst(datasource.datasourcePort, base.database.port)) || base.database.port,
      database: normalizeText(pickFirst(datasource.datasourceDatabase, payload.databaseName), base.database.database),
      status: normalizeStatus(pickFirst(datasource.status, health.datasourceStatus, payload.datasourceStatus), base.database.status),
      // latencyMs: Number(pickFirst(datasource.latencyMs, payload.datasourceLatencyMs, base.database.latencyMs)) || base.database.latencyMs,
    },
    redis: {
      ...base.redis,
      host: normalizeText(pickFirst(redis.host, payload.redisHost), base.redis.host),
      port: Number(pickFirst(redis.port, payload.redisPort, base.redis.port)) || base.redis.port,
      database: Number(pickFirst(redis.database, payload.redisDatabase, base.redis.database)) || base.redis.database,
      status: normalizeStatus(pickFirst(redis.status, health.redisStatus, payload.redisStatus), base.redis.status),
      latencyMs: Number(pickFirst(redis.latencyMs, payload.redisLatencyMs, base.redis.latencyMs)) || base.redis.latencyMs,
    },
    jvm: normalizeJvmPayload(jvm),
    health: {
      ...base.health,
      overallStatus: normalizeStatus(pickFirst(health.overallStatus, payload.overallStatus, payload.status), base.health.overallStatus),
      datasourceStatus: normalizeStatus(pickFirst(health.datasourceStatus, datasource.status, payload.datasourceStatus), base.health.datasourceStatus),
      redisStatus: normalizeStatus(pickFirst(health.redisStatus, redis.status, payload.redisStatus), base.health.redisStatus),
      message: normalizeText(pickFirst(health.message, payload.message), base.health.message),
    },
    metrics: {
      cpu: normalizeSeries(pickFirst(os.cpu, os.systemCpuLoadHistory, payload.cpu, base.metrics.cpu)),
      memory: normalizeSeries(pickFirst(os.memory, os.memoryUsageHistory, payload.memory, base.metrics.memory)),
      disk: normalizeSeries(pickFirst(os.disk, os.diskUsageHistory, payload.disk, base.metrics.disk)),
    },
    loadAverage: normalizeLoadAverage(pickFirst(os.loadAverage, payload.loadAverage, base.loadAverage)),
    config: normalizeConfigList(config, base.config),
    logs: normalizeLogList(logs, base.logs),
  };
}

function normalizeSeries(series) {
  if (!Array.isArray(series) || !series.length) return [];

  return series.map((item) => {
    if (typeof item === 'number') {
      return Math.max(0, Math.min(100, Number(item.toFixed(1))));
    }
    if (item && typeof item === 'object') {
      const value = Number(item.value ?? item.percent ?? item.y ?? 0);
      return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    }
    const value = Number(item);
    return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  });
}

function normalizeConfigList(raw, fallback = []) {
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((item) => ({
        label: normalizeText(item?.label),
        value: normalizeText(item?.value),
      }))
      .filter((item) => item.label);
  }

  if (raw && typeof raw === 'object') {
    return [
      {
        label: '数据库',
        value: `${pickFirst(raw.databaseName, raw.database, raw.dbName, '-')}` +
          `@${pickFirst(raw.databaseHost, raw.host, raw.dbHost, '-')}` +
          `${pickFirst(raw.databasePort, raw.port, raw.dbPort) ? `:${pickFirst(raw.databasePort, raw.port, raw.dbPort)}` : ''}`,
      },
      {
        label: 'Redis',
        value: `${pickFirst(raw.redisHost, raw.cacheHost, '-')}` +
          `${pickFirst(raw.redisPort, raw.cachePort) ? `:${pickFirst(raw.redisPort, raw.cachePort)}` : ''}` +
          `${pickFirst(raw.redisDatabase, raw.cacheDatabase) !== undefined ? ` / DB ${pickFirst(raw.redisDatabase, raw.cacheDatabase)}` : ''}`,
      },
      {
        label: 'server.port',
        value: normalizeText(pickFirst(raw.serverPort, raw.port), '-'),
      },
      {
        label: 'timeZone',
        value: normalizeText(pickFirst(raw.timeZone, raw.timezone), '-'),
      },
      {
        label: 'cacheSchedulerEnabled',
        value: String(pickFirst(raw.cacheSchedulerEnabled, raw.cacheScheduler, false)),
      },
    ].filter((item) => item.value && item.value !== '-');
  }

  return fallback;
}

function normalizeLogList(raw, fallback = []) {
  if (!Array.isArray(raw) || !raw.length) {
    return fallback;
  }

  return raw.slice(0, 5).map((item) => ({
    time: normalizeText(item?.time ?? item?.createdAt ?? item?.timestamp, formatNow()),
    level: normalizeText(item?.level ?? item?.severity ?? 'INFO', 'INFO').toUpperCase(),
    content: normalizeText(item?.content ?? item?.message, ''),
  })).filter((item) => item.content);
}

function applyDashboardPayload(raw) {
  dashboard.value = normalizeDashboard(raw);
  lastRefreshText.value = formatNow();
}

function markRemoteSource() {
  dashboard.value = {
    ...dashboard.value,
    summary: {
      ...dashboard.value.summary,
      source: 'remote',
    },
  };
}

function applyOverviewPayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  dashboard.value = {
    ...dashboard.value,
    summary: {
      ...dashboard.value.summary,
      status: normalizeStatus(
        pickFirst(payload.status, payload.overallStatus, payload.health?.overallStatus, dashboard.value.summary.status),
        dashboard.value.summary.status,
      ),
      message: normalizeText(
        pickFirst(payload.message, payload.health?.message, dashboard.value.summary.message),
        dashboard.value.summary.message,
      ),
      updatedAt: normalizeText(payload.updatedAt, formatNow()),
      source: 'remote',
    },
    application: {
      ...dashboard.value.application,
      name: normalizeText(pickFirst(payload.name, payload.serviceName, payload.appName), dashboard.value.application.name),
      version: normalizeText(pickFirst(payload.appVersion, payload.version), dashboard.value.application.version),
      port: Number(pickFirst(payload.port, payload.serverPort, dashboard.value.application.port)) || dashboard.value.application.port,
      startTime: normalizeText(pickFirst(payload.startTime, payload.startedAt), dashboard.value.application.startTime),
      runtime: normalizeText(pickFirst(payload.runtime, formatUptime(payload.uptimeSeconds)), dashboard.value.application.runtime),
    },
    server: {
      ...dashboard.value.server,
      hostName: normalizeText(pickFirst(payload.hostName, payload.hostname), dashboard.value.server.hostName),
      ip: normalizeText(pickFirst(payload.hostAddress, payload.ip), dashboard.value.server.ip),
      os: normalizeOsLabel({
        osName: pickFirst(payload.osName, payload.os),
        osVersion: payload.osVersion,
        osArch: payload.osArch,
      }, dashboard.value.server.os),
      cpuCores: Number(pickFirst(payload.availableProcessors, payload.cpuCores, dashboard.value.server.cpuCores)) || dashboard.value.server.cpuCores,
    },
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyHealthPayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  dashboard.value = {
    ...dashboard.value,
    summary: {
      ...dashboard.value.summary,
      status: normalizeStatus(pickFirst(payload.overallStatus, payload.status, dashboard.value.summary.status), dashboard.value.summary.status),
      message: normalizeText(pickFirst(payload.message, dashboard.value.summary.message), dashboard.value.summary.message),
      updatedAt: payload.updatedAt || formatNow(),
      source: 'remote',
    },
    health: {
      ...dashboard.value.health,
      overallStatus: normalizeStatus(pickFirst(payload.overallStatus, payload.status, dashboard.value.health.overallStatus), dashboard.value.health.overallStatus),
      datasourceStatus: normalizeStatus(pickFirst(payload.datasourceStatus, dashboard.value.health.datasourceStatus), dashboard.value.health.datasourceStatus),
      redisStatus: normalizeStatus(pickFirst(payload.redisStatus, dashboard.value.health.redisStatus), dashboard.value.health.redisStatus),
      message: normalizeText(pickFirst(payload.message, dashboard.value.health.message), dashboard.value.health.message),
    },
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyDatasourcePayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  dashboard.value = {
    ...dashboard.value,
    database: {
      ...dashboard.value.database,
      type: normalizeText(pickFirst(payload.type, dashboard.value.database.type), dashboard.value.database.type),
      host: normalizeText(pickFirst(payload.host, dashboard.value.database.host), dashboard.value.database.host),
      port: Number(pickFirst(payload.port, dashboard.value.database.port)) || dashboard.value.database.port,
      database: normalizeText(pickFirst(payload.database, payload.databaseName), dashboard.value.database.database),
      status: normalizeStatus(pickFirst(payload.status, dashboard.value.health.datasourceStatus), dashboard.value.database.status),
      latencyMs: Number(pickFirst(payload.latencyMs, dashboard.value.database.latencyMs)) || dashboard.value.database.latencyMs,
    },
    health: {
      ...dashboard.value.health,
      datasourceStatus: normalizeStatus(pickFirst(payload.status, dashboard.value.health.datasourceStatus), dashboard.value.health.datasourceStatus),
      message: normalizeText(pickFirst(payload.message, dashboard.value.health.message), dashboard.value.health.message),
    },
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyRedisPayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  dashboard.value = {
    ...dashboard.value,
    redis: {
      ...dashboard.value.redis,
      host: normalizeText(pickFirst(payload.host, dashboard.value.redis.host), dashboard.value.redis.host),
      port: Number(pickFirst(payload.port, dashboard.value.redis.port)) || dashboard.value.redis.port,
      database: Number(pickFirst(payload.database, payload.db, dashboard.value.redis.database)) || dashboard.value.redis.database,
      status: normalizeStatus(pickFirst(payload.status, dashboard.value.health.redisStatus), dashboard.value.redis.status),
      latencyMs: Number(pickFirst(payload.latencyMs, dashboard.value.redis.latencyMs)) || dashboard.value.redis.latencyMs,
    },
    health: {
      ...dashboard.value.health,
      redisStatus: normalizeStatus(pickFirst(payload.status, dashboard.value.health.redisStatus), dashboard.value.health.redisStatus),
      message: normalizeText(pickFirst(payload.message, dashboard.value.health.message), dashboard.value.health.message),
    },
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyJvmPayload(raw) {
  const payload = normalizeJvmPayload(raw && typeof raw === 'object' ? raw : {});
  dashboard.value = {
    ...dashboard.value,
    jvm: {
      ...dashboard.value.jvm,
      ...payload,
    },
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyOsPayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  const cpuValue = toPercent(pickFirst(payload.systemCpuLoadPercent, payload.cpuPercent, payload.cpu));
  const memoryValue = toPercent(pickFirst(payload.memoryUsagePercent, payload.memoryPercent, payload.memory));
  const diskValue = toPercent(pickFirst(payload.diskUsagePercent, payload.diskPercent, payload.disk));
  const loadAverage = Array.isArray(payload.loadAverage) ? normalizeLoadAverage(payload.loadAverage) : dashboard.value.loadAverage;

  dashboard.value = {
    ...dashboard.value,
    server: {
      ...dashboard.value.server,
      hostName: normalizeText(pickFirst(payload.hostName, dashboard.value.server.hostName), dashboard.value.server.hostName),
      ip: normalizeText(pickFirst(payload.hostAddress, payload.ip, dashboard.value.server.ip), dashboard.value.server.ip),
      os: normalizeOsLabel({
        osName: pickFirst(payload.osName, payload.systemName, payload.os),
        osVersion: payload.osVersion,
        osArch: payload.osArch,
      }, dashboard.value.server.os),
      cpuCores: Number(pickFirst(payload.availableProcessors, payload.cpuCores, dashboard.value.server.cpuCores)) || dashboard.value.server.cpuCores,
    },
    metrics: {
      cpu: Number.isFinite(cpuValue) ? pushTrend(createMetricTrend('cpu'), cpuValue) : dashboard.value.metrics.cpu,
      memory: Number.isFinite(memoryValue) ? pushTrend(createMetricTrend('memory'), memoryValue) : dashboard.value.metrics.memory,
      disk: Number.isFinite(diskValue) ? pushTrend(createMetricTrend('disk'), diskValue) : dashboard.value.metrics.disk,
    },
    loadAverage,
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyConfigPayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  dashboard.value = {
    ...dashboard.value,
    config: normalizeConfigList(payload, dashboard.value.config),
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applyLogsPayload(raw) {
  const payload = raw && typeof raw === 'object' ? raw : {};
  const list = payload.list || payload.logs || payload;
  dashboard.value = {
    ...dashboard.value,
    logs: normalizeLogList(list, dashboard.value.logs),
  };
  markRemoteSource();
  lastRefreshText.value = formatNow();
}

function applySectionPayload(section, payload) {
  switch (section) {
    case 'overview':
      applyOverviewPayload(payload);
      break;
    case 'health':
      applyHealthPayload(payload);
      break;
    case 'datasource':
      applyDatasourcePayload(payload);
      break;
    case 'redis':
      applyRedisPayload(payload);
      break;
    case 'jvm':
      applyJvmPayload(payload);
      break;
    case 'os':
      applyOsPayload(payload);
      break;
    case 'config':
      applyConfigPayload(payload);
      break;
    case 'logs':
      applyLogsPayload(payload);
      break;
    case 'dashboard':
      applyDashboardPayload(payload);
      break;
    default:
      break;
  }
}

async function requestSection(section) {
  try {
    const apiMap = {
      overview: monitorApi.getOverview,
      health: monitorApi.getHealth,
      datasource: monitorApi.getDataSource,
      redis: monitorApi.getRedis,
      jvm: monitorApi.getJvm,
      os: monitorApi.getOs,
      config: monitorApi.getConfig,
      logs: monitorApi.getLogs,
    };

    const response = section === 'logs'
      ? await apiMap[section]({ limit: 5 })
      : await apiMap[section]();
    applySectionPayload(section, unwrapApiPayload(response));
    return true;
  } catch {
    return false;
  }
}

async function loadFallbackSections() {
  await Promise.allSettled([
    requestSection('overview'),
    requestSection('health'),
    requestSection('datasource'),
    requestSection('redis'),
    requestSection('jvm'),
    requestSection('os'),
    requestSection('config'),
    requestSection('logs'),
  ]);
}

async function loadDashboardData() {
  loading.value = true;
  try {
    const response = await monitorApi.getDashboard();
    applyDashboardPayload(unwrapApiPayload(response));
  } catch {
    await loadFallbackSections();
  } finally {
    lastRefreshText.value = formatNow();
    loading.value = false;
    startRealtime();
  }
}

async function handleRefresh() {
  await loadDashboardData();
  ElMessage.success('监控数据已刷新');
}

function stopStream() {
  if (streamSource) {
    streamSource.close();
    streamSource = null;
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

/**
 * 将SSE事件中的数据解析为对象格式，优先尝试解析为JSON，失败后作为纯文本处理
 * @param event SSE事件对象，包含原始数据在event.data中
 * @returns 解析后的对象，包含原始数据的message字段以供备用
 */
function parseStreamPayload(event) {
  const raw = event?.data;
  if (!raw) {
    return {};
  }

  if (typeof raw === 'object') {
    return raw;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { message: String(raw) };
  }
}

function handleStreamEvent(eventName, event) {
  applySectionPayload(eventName, parseStreamPayload(event));
  connectionStatus.value = 'open';
  realtimeMode.value = 'sse';
  retryCount.value = 0;
}

function handleStreamFailure() {
  if (realtimeMode.value === 'polling') {
    return;
  }

  stopStream();
  stopPolling();
  retryCount.value += 1;

  if (retryCount.value >= MAX_STREAM_RETRY) {
    startPolling();
    return;
  }

  connectionStatus.value = 'reconnecting';
  reconnectTimer = window.setTimeout(() => {
    connectStream();
  }, RECONNECT_DELAY);
}

function connectStream() {
  if (typeof window === 'undefined' || typeof window.EventSource !== 'function') {
    startPolling();
    return;
  }

  stopStream();
  stopPolling();

  try {
    connectionStatus.value = retryCount.value > 0 ? 'reconnecting' : 'connecting';
    const source = new EventSource(monitorApi.getStreamUrl(), { withCredentials: true });
    streamSource = source;

    source.addEventListener('open', () => {
      connectionStatus.value = 'open';
      realtimeMode.value = 'sse';
      retryCount.value = 0;
    });

    ['overview', 'health', 'datasource', 'redis', 'jvm', 'os', 'config', 'logs', 'dashboard'].forEach((eventName) => {
      source.addEventListener(eventName, (event) => {
        handleStreamEvent(eventName, event);
      });
    });

    source.onerror = () => {
      handleStreamFailure();
    };
  } catch {
    startPolling();
  }
}

/**
 * 运行轮询任务
 * 每 15 秒刷新一次核心数据，每 60 秒刷新一次全部数据
 * @param withLowFrequency - 是否包含低频数据（overview、datasource、redis、config、logs）
 */
async function runPollingTick(withLowFrequency = false) {
  const tasks = [
    requestSection('health'),
    requestSection('jvm'),
    requestSection('os'),
  ];

  if (withLowFrequency) {
    tasks.push(
      requestSection('overview'),
      requestSection('datasource'),
      requestSection('redis'),
      requestSection('config'),
      requestSection('logs'),
    );
  }

  await Promise.allSettled(tasks);
}

function startPolling() {
  stopStream();
  stopPolling();
  realtimeMode.value = 'polling';
  connectionStatus.value = 'fallback';
  retryCount.value = 0;
  runPollingTick(true);
  pollTimer = window.setInterval(() => {
    pollTick.value += 1;
    runPollingTick(pollTick.value % 4 === 0);
  }, POLL_INTERVAL);
}

function startRealtime() {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.EventSource !== 'function') {
    startPolling();
    return;
  }

  connectStream();
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

onMounted(() => {
  loadDashboardData();
});

onUnmounted(() => {
  stopStream();
  stopPolling();
});
</script>

<style scoped>
:global(:root) {
  --monitor-bg: #edf2f7;
  --monitor-bg-2: #f7fafc;
  --monitor-card: rgba(255, 255, 255, 0.88);
  --monitor-border: rgba(15, 23, 42, 0.08);
  --monitor-text: #0f172a;
  --monitor-sub: #64748b;
}

.monitor-page {
  width: 100%;
  min-height: 100vh;
  padding: 28px 18px 40px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.8), transparent 28%),
    radial-gradient(circle at 85% 18%, rgba(37, 99, 235, 0.08), transparent 22%),
    linear-gradient(180deg, var(--monitor-bg) 0%, var(--monitor-bg-2) 100%);
  color: var(--monitor-text);
}

.monitor-shell {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
}

.hero-card,
.panel-card,
.metric-card {
  background: var(--monitor-card);
  border: 1px solid var(--monitor-border);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(10px);
}

.hero-card {
  border-radius: 24px;
  padding: 26px 28px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  color: #2563eb;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(26px, 3vw, 40px);
  line-height: 1.12;
  font-weight: 800;
}

.hero-desc {
  margin: 12px 0 0;
  max-width: 760px;
  color: var(--monitor-sub);
  line-height: 1.7;
  font-size: 14px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  color: var(--monitor-sub);
  font-size: 13px;
}

.meta-dot {
  color: #cbd5e1;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.refresh-btn {
  border-radius: 12px;
  padding-inline: 18px;
}

.hero-state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--monitor-sub);
  font-size: 13px;
}

.state-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.12);
}

.state-dot--small {
  width: 8px;
  height: 8px;
  box-shadow: none;
}

.state-dot.is-success {
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.state-dot.is-warning {
  background: #f59e0b;
  box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.12);
}

.state-dot.is-danger {
  background: #ef4444;
  box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.12);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.8fr);
  gap: 14px;
}

.left-column,
.right-column {
  display: grid;
  gap: 14px;
}

.metric-card {
  border-radius: 20px;
  --stat-card-padding: 20px;
  --stat-card-radius: 20px;
  --stat-card-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  --stat-card-hover-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
  --stat-value-size: 30px;
  --stat-value-weight: 800;
  --stat-value-color: #0f172a;
  --stat-label-color: #475569;
  --stat-sub-color: #64748b;
}

.panel-card {
  border-radius: 20px;
  padding: 20px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--monitor-text);
}

.panel-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--monitor-sub);
}

.health-list,
.metric-list,
.config-list,
.log-list {
  display: grid;
  gap: 12px;
}

.health-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.health-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.health-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--item-color);
  background: color-mix(in srgb, var(--item-color) 12%, white);
  border: 1px solid color-mix(in srgb, var(--item-color) 18%, white);
  flex-shrink: 0;
}

.health-name {
  font-size: 14px;
  font-weight: 700;
}

.health-desc {
  margin-top: 3px;
  font-size: 12px;
  color: var(--monitor-sub);
}

.metric-row {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.metric-row-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.metric-label {
  font-size: 14px;
  font-weight: 700;
}

.metric-note {
  margin-top: 3px;
  font-size: 12px;
  color: var(--monitor-sub);
}

.metric-value {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.sparkline {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 6px;
  align-items: end;
  height: 48px;
  margin-top: 10px;

}

.spark-bar {
  display: block;
  min-height: 10px;
  border-radius: 999px 999px 6px 6px;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.load-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 6px;
  color: var(--monitor-sub);
  font-size: 13px;
}

.load-value {
  font-weight: 700;
  color: var(--monitor-text);
}

.jvm-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.jvm-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.jvm-item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.jvm-label {
  font-size: 12px;
  color: var(--monitor-sub);
}

.jvm-value {
  font-size: 15px;
  font-weight: 800;
  color: var(--monitor-text);
}

.jvm-desc {
  margin-bottom: 10px;
  color: var(--monitor-sub);
  font-size: 12px;
}

.summary-block {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.summary-label,
.config-label {
  display: block;
  font-size: 12px;
  color: var(--monitor-sub);
}

.summary-value,
.config-value {
  display: block;
  margin-top: 5px;
  font-size: 14px;
  font-weight: 700;
  color: var(--monitor-text);
  word-break: break-word;
}

.config-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.log-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.log-item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.log-time {
  font-size: 12px;
  color: var(--monitor-sub);
}

.log-content {
  margin-top: 8px;
  font-size: 13px;
  color: #334155;
  line-height: 1.65;
}

@media (max-width: 1180px) {

  .stat-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .jvm-grid {
    grid-template-columns: 1fr;
  }

  .summary-block {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .monitor-page {
    padding: 16px 12px 24px;
  }

  .hero-card {
    padding: 20px 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    width: 100%;
    align-items: flex-start;
  }

  .panel-card {
    padding: 16px;
  }

  .health-item,
  .config-row,
  .metric-row,
  .log-item {
    padding: 12px;
  }

  .health-item,
  .config-row,
  .log-item-head,
  .metric-row-head,
  .load-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
