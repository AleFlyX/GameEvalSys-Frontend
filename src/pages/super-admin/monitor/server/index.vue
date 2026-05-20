<template>
  <PagePanel class="monitor-page" :bg-card="false">
    <template #header>
      <StatCard v-for="item in summaryCards" :key="item.label" class="metric-card" :label="item.label"
        :value="item.value" :sub="item.sub" label-placement="body" :icon="item.icon" :icon-color="item.iconColor"
        :icon-bg="item.iconBg" :icon-size="42" :icon-radius="14" />
    </template>

    <div class="monitor-toolbar-shell">
      <monitorPageHero :status-meta="statusMeta" :transport-text="transportText" :dashboard-summary="dashboard.summary"
        :connection-meta="connectionMeta" :last-refresh-text="lastRefreshText" :loading="loading"
        @refresh="handleRefresh" />
    </div>

    <template #main-table>
      <section class="content-grid">
        <div class="left-column">
          <MonitorCard title="健康总览" subtitle="服务状态、数据库和缓存状态">
            <template #subheader>
              <el-tag effect="light" :type="statusMeta.type">
                {{ dashboard.application.port ? `PORT ${dashboard.application.port}` : 'PORT --' }}
              </el-tag>
            </template>
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
          </MonitorCard>

          <MonitorCard title="资源使用" subtitle="CPU、内存和磁盘的实时使用情况">
            <div v-for="item in resourceItems" :key="item.label" class="metric-row">
              <div class="metric-row-head">
                <div>
                  <div class="metric-label">{{ item.label }}</div>
                  <div class="metric-note">{{ item.note }}</div>
                </div>
                <div class="metric-value">{{ item.value }}%</div>
              </div>

              <el-progress :percentage="Number(item.value)" :stroke-width="8" :color="item.color" :show-text="false" />

              <div class="sparkline">
                <span v-for="(point, index) in item.trend" :key="`${item.label}-${index}`" class="spark-bar"
                  :style="{ height: `${point}%`, backgroundColor: item.color, animationDelay: `${index * 0.04}s` }" />
              </div>
            </div>
            <div class="load-row">
              <span class="load-label">负载均值 (1m / 5m / 15m)</span>
              <span class="load-value">{{ dashboard.loadAverage.join(' / ') }}</span>
            </div>
          </MonitorCard>

          <MonitorCard title="JVM 运行态" subtitle="堆内存、提交内存、最大内存与线程数">
            <div class="jvm-grid">
              <div v-for="item in jvmItems" :key="item.label" class="jvm-item">
                <div class="jvm-item-head">
                  <span class="jvm-label">{{ item.label }}</span>
                  <span class="jvm-value">{{ item.value }}</span>
                </div>
                <div class="jvm-desc">{{ item.desc }}</div>
                <el-progress v-if="typeof item.percentage === 'number'" :percentage="Number(item.percentage)"
                  :stroke-width="7" :color="item.color" :show-text="false" />
              </div>
            </div>
          </MonitorCard>
        </div>

        <div class="right-column">
          <MonitorCard title="运行摘要" subtitle="主机、应用的最小必要信息">
            <div class="summary-block">
              <div class="summary-item" v-for="item in summaryItems" :key="item.name">
                <span class="summary-label">{{ item.label }}</span>
                <span class="summary-value">{{ item.value }}</span>
              </div>
            </div>
          </MonitorCard>

          <MonitorCard title="配置摘要" subtitle="只展示脱敏后的关键信息，不回显敏感配置" :max-height="'500px'">
            <div v-for="item in configItems" :key="item.label" class="config-row">
              <span class="config-label">{{ item.label }}</span>
              <span class="config-value">{{ item.value }}</span>
            </div>
          </MonitorCard>

          <MonitorCard title="最近告警 / 日志" :subtitle="`${dashboard.logs.length} 条最新记录`">
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
          </MonitorCard>
        </div>
      </section>
    </template>
  </PagePanel>
</template>

<script setup lang="ts">
import PagePanel from '@/layouts/PagePanel.vue';
import StatCard from '@/components/common/data/StatCard.vue';
import { useMonitorServer } from './composables/useMonitorServer';
import monitorPageHero from './components/monitorPageHero.vue';
import MonitorCard from './components/monitorCard.vue';

defineOptions({
  name: 'ServerMonitorIndex',
});

const {
  loading,
  dashboard,
  lastRefreshText,
  statusMeta,
  connectionMeta,
  transportText,
  summaryCards,
  healthItems,
  resourceItems,
  jvmItems,
  summaryItems,
  configItems,
  logTypeMap,
  handleRefresh,
} = useMonitorServer();
</script>

<style scoped>
@import './styles/media.css';

:global(:root) {
  --monitor-bg: #edf2f7;
  --monitor-bg-2: #f7fafc;
  --monitor-card: rgba(255, 255, 255, 0.88);
  --monitor-border: rgba(15, 23, 42, 0.08);
  --monitor-text: #0f172a;
  --monitor-sub: #64748b;
}

.monitor-page {
  --panel-max-width: min(1360px, calc(100% - 40px));
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.8), transparent 28%),
    radial-gradient(circle at 85% 18%, rgba(37, 99, 235, 0.08), transparent 22%),
    linear-gradient(180deg, var(--monitor-bg) 0%, var(--monitor-bg-2) 100%);
  color: var(--monitor-text);
}

.monitor-page :deep(.panel-header) {
  gap: 14px;
}

.monitor-page :deep(.data-list) {
  padding-top: 24px;
}

.monitor-toolbar-shell {
  display: grid;
  gap: 16px;
}

.metric-card {
  background: var(--monitor-card);
  border: 1px solid var(--monitor-border);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(10px);
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
  transform: scaleY(0);
  transform-origin: bottom;
  transition: height 0.3s ease;
  animation: sparkRise 0.6s cubic-bezier(0.2, 0.95, 0.4, 1.05) forwards;
}

@keyframes sparkRise {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
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
</style>
