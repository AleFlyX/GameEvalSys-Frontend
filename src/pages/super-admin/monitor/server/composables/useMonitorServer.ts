import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";

import { useLoading } from "@/composables/useLoading";
import { formatBytes, formatNow, formatUptime } from "./utils/formatters";
import { createMockDashboard, normalizeDashboard } from "./models/dashboardModel";
import { normalizeJvmPayload } from "./models/jvmModel";
import { normalizeConfigList, normalizeLogList } from "./models/configModel";
import { useMonitorApi } from "./api/useMonitorApi";
import { useRealtimeMonitor } from "./realtime/useRealtimeMonitor";
import { normalizeStatus, normalizeText, normalizeOsLabel, toPercent } from "./utils/normalizers";
import type { DashboardModel, MetricKey } from "./models/types";

const POLL_INTERVAL = 15000;

export const logTypeMap = {
  INFO: "info",
  WARN: "warning",
  ERROR: "danger",
} as const;

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
}

export function useMonitorServer() {
  const { isLoading: loading, start: startLoading, end: endLoading } = useLoading("monitorServer");

  const lastRefreshText = ref(formatNow());
  const dashboard = ref<DashboardModel>(createMockDashboard());

  /**
   * 将新值添加到趋势数据中，并保持长度不超过 8 个数据点
   * @param series 当前的趋势数据数组
   * @param value 新的数值
   * @returns 更新后的趋势数据数组
   */
  function pushTrend(series: number[], value: number) {
    const next = [...series];
    if (!Number.isFinite(value)) return next;
    next.push(Number(value.toFixed(1)));
    while (next.length > 8) {
      next.shift();
    }
    return next;
  }

  /**
   * 获取趋势数据的显示系列，将数值转换为 18-100 的范围以适配图表显示
   * @param series
   * @returns
   */
  function getTrendDisplaySeries(series: number[]) {
    if (!Array.isArray(series) || series.length === 0) {
      return [];
    }

    const values = series.filter((item) => Number.isFinite(item));
    if (!values.length) {
      return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (max <= min) {
      return values.map(() => 36); // 当所有数值相同或无有效数值时，返回一个固定的中等高度（如 36%）以保持图表显示的一致性
    }

    return values.map((value) => {
      const ratio = (value - min) / (max - min);
      return Number((18 + ratio * 82).toFixed(1)); // 将数值映射到 18-100 的范围
    });
  }

  /**
   * 获取实时指标的最新值，若无数据则返回 "0.0"
   * @param key 指标名称，需与 dashboard.value.metrics 中的键对应
   * @returns 格式化为字符串的数值，保留一位小数
   */
  function getMetricValue(key: MetricKey) {
    const series = dashboard.value.metrics[key];
    const last = series[series.length - 1];
    return Number.isFinite(last) ? Number(last).toFixed(1) : "0.0";
  }

  /**
   * 获取 JVM 堆内存使用百分比
   * @returns 格式化为字符串的数值，保留一位小数
   */
  function getJvmHeapUsagePercent() {
    const max = Number(dashboard.value.jvm.heapMaxBytes || 0);
    const used = Number(dashboard.value.jvm.heapUsedBytes || 0);
    if (!max) {
      return 0;
    }
    return Number(((used / max) * 100).toFixed(1));
  }

  /**
   * 触摸远程数据，更新最后刷新时间文本
   */
  function touchRemote() {
    dashboard.value = {
      ...dashboard.value,
      summary: {
        ...dashboard.value.summary,
        source: "remote", // 标记数据来源为远程，以区分初始示例数据
      },
    };
    lastRefreshText.value = formatNow();
  }

  function applyOverviewPayload(raw: unknown) {
    const payload = asRecord(raw);
    dashboard.value = {
      ...dashboard.value,
      summary: {
        ...dashboard.value.summary,
        updatedAt: normalizeText(payload.generatedAt, dashboard.value.summary.updatedAt),
      },
      application: {
        ...dashboard.value.application,
        version: normalizeText(payload.appVersion, dashboard.value.application.version),
        port: Number(payload.serverPort) || dashboard.value.application.port,
        startTime: normalizeText(payload.startTime, dashboard.value.application.startTime),
        runtime: normalizeText(
          payload.uptimeText,
          formatUptime(Number(payload.uptimeMillis || 0) / 1000),
        ),
      },
      server: {
        ...dashboard.value.server,
        hostName: normalizeText(payload.hostName, dashboard.value.server.hostName),
        ip: normalizeText(payload.hostAddress, dashboard.value.server.ip),
        os: normalizeOsLabel(
          {
            osName: payload.osName,
            osVersion: payload.osVersion,
            osArch: payload.osArch,
          },
          dashboard.value.server.os,
        ),
        cpuCores: Number(payload.availableProcessors) || dashboard.value.server.cpuCores,
      },
    };
    touchRemote();
  }

  function applyHealthPayload(raw: unknown) {
    const payload = asRecord(raw);
    dashboard.value = {
      ...dashboard.value,
      summary: {
        ...dashboard.value.summary,
        status: normalizeStatus(payload.overallStatus, dashboard.value.summary.status),
        message: normalizeText(payload.message, dashboard.value.summary.message),
      },
      health: {
        ...dashboard.value.health,
        overallStatus: normalizeStatus(payload.overallStatus, dashboard.value.health.overallStatus),
        datasourceStatus: normalizeStatus(
          payload.datasourceStatus,
          dashboard.value.health.datasourceStatus,
        ),
        redisStatus: normalizeStatus(payload.redisStatus, dashboard.value.health.redisStatus),
        message: normalizeText(payload.message, dashboard.value.health.message),
      },
    };
    touchRemote();
  }

  function applyDatasourcePayload(raw: unknown) {
    const payload = asRecord(raw);
    dashboard.value = {
      ...dashboard.value,
      database: {
        ...dashboard.value.database,
        type: normalizeText(payload.jdbcType, dashboard.value.database.type),
        status: normalizeStatus(payload.status, dashboard.value.database.status),
      },
      health: {
        ...dashboard.value.health,
        datasourceStatus: normalizeStatus(payload.status, dashboard.value.health.datasourceStatus),
        message: normalizeText(payload.message, dashboard.value.health.message),
      },
    };
    touchRemote();
  }

  function applyRedisPayload(raw: unknown) {
    const payload = asRecord(raw);
    dashboard.value = {
      ...dashboard.value,
      redis: {
        ...dashboard.value.redis,
        host: normalizeText(payload.host, dashboard.value.redis.host),
        port: Number(payload.port) || dashboard.value.redis.port,
        database: Number(payload.database) || dashboard.value.redis.database,
        status: normalizeStatus(payload.status, dashboard.value.redis.status),
      },
      health: {
        ...dashboard.value.health,
        redisStatus: normalizeStatus(payload.status, dashboard.value.health.redisStatus),
        message: normalizeText(payload.message, dashboard.value.health.message),
      },
    };
    touchRemote();
  }

  function applyJvmPayload(raw: unknown) {
    dashboard.value = {
      ...dashboard.value,
      jvm: {
        ...dashboard.value.jvm,
        ...normalizeJvmPayload(raw as any),
      },
    };
    touchRemote();
  }

  function applyOsPayload(raw: unknown) {
    const payload = asRecord(raw);
    const cpuValue = toPercent(payload.systemCpuLoadPercent);
    const memoryValue = toPercent(payload.memoryUsagePercent);
    const diskValue = toPercent(payload.diskUsagePercent);

    dashboard.value = {
      ...dashboard.value,
      server: {
        ...dashboard.value.server,
        os: normalizeOsLabel(
          {
            osName: payload.osName,
            osVersion: payload.osVersion,
            osArch: payload.osArch,
          },
          dashboard.value.server.os,
        ),
        cpuCores: Number(payload.availableProcessors) || dashboard.value.server.cpuCores,
      },
      metrics: {
        cpu:
          cpuValue !== null
            ? pushTrend(dashboard.value.metrics.cpu, cpuValue)
            : dashboard.value.metrics.cpu,
        memory:
          memoryValue !== null
            ? pushTrend(dashboard.value.metrics.memory, memoryValue)
            : dashboard.value.metrics.memory,
        disk:
          diskValue !== null
            ? pushTrend(dashboard.value.metrics.disk, diskValue)
            : dashboard.value.metrics.disk,
      },
    };
    touchRemote();
  }

  function applyConfigPayload(raw: unknown) {
    const payload = asRecord(raw);
    dashboard.value = {
      ...dashboard.value,
      config: normalizeConfigList(payload, dashboard.value.config),
      database: {
        ...dashboard.value.database,
        host: normalizeText(payload.datasourceHost, dashboard.value.database.host),
        port: Number(payload.datasourcePort) || dashboard.value.database.port,
        database: normalizeText(payload.datasourceDatabase, dashboard.value.database.database),
      },
    };
    touchRemote();
  }

  function applyLogsPayload(raw: unknown) {
    dashboard.value = {
      ...dashboard.value,
      logs: normalizeLogList(raw, dashboard.value.logs),
    };
    touchRemote();
  }

  function applySectionPayload(section: string, payload: unknown) {
    switch (section) {
      case "overview":
        applyOverviewPayload(payload);
        break;
      case "health":
        applyHealthPayload(payload);
        break;
      case "datasource":
        applyDatasourcePayload(payload);
        break;
      case "redis":
        applyRedisPayload(payload);
        break;
      case "jvm":
        applyJvmPayload(payload);
        break;
      case "os":
        applyOsPayload(payload);
        break;
      case "config":
        applyConfigPayload(payload);
        break;
      case "logs":
        applyLogsPayload(payload);
        break;
      case "dashboard":
        dashboard.value = normalizeDashboard(payload, dashboard.value);
        lastRefreshText.value = formatNow();
        break;
      default:
        break;
    }
  }

  const { requestSection, loadDashboardData: loadFullDashboard } =
    useMonitorApi(applySectionPayload);
  const { connectionStatus, realtimeMode, startRealtime, stopAll } =
    useRealtimeMonitor(applySectionPayload);

  const statusMeta = computed(() => {
    const status = dashboard.value.summary.status || dashboard.value.health.overallStatus || "UP";
    if (status === "DOWN") {
      return { text: "告警", type: "danger", className: "is-danger" };
    }
    if (status === "WARN") {
      return { text: "注意", type: "warning", className: "is-warning" };
    }
    return { text: "正常", type: "success", className: "is-success" };
  });

  const connectionMeta = computed(() => {
    if (realtimeMode.value === "sse") {
      return { text: "SSE 实时刷新", className: "is-success" };
    }

    if (realtimeMode.value === "polling") {
      return { text: `轮询兜底 · ${Math.round(POLL_INTERVAL / 1000)} 秒`, className: "is-warning" };
    }

    if (connectionStatus.value === "reconnecting") {
      return { text: "SSE 重连中", className: "is-warning" };
    }

    if (connectionStatus.value === "fallback") {
      return { text: "轮询兜底中", className: "is-warning" };
    }

    if (connectionStatus.value === "open") {
      return { text: "SSE 已连接", className: "is-success" };
    }

    return { text: "正在建立 SSE 连接", className: "is-warning" };
  });

  const transportText = computed(() => {
    if (dashboard.value.summary.source !== "remote") {
      return "本地示例数据";
    }

    if (realtimeMode.value === "sse") {
      return "已连接后端监控接口";
    }

    if (realtimeMode.value === "polling") {
      return "后端接口 · 轮询刷新";
    }

    return "后端接口已加载";
  });

  const summaryCards = computed(() => [
    {
      label: "总体健康",
      value: statusMeta.value.text,
      sub: dashboard.value.summary.message,
      icon: "Checked",
      iconColor: "#2563eb",
      iconBg: "#eaf2ff",
    },
    {
      label: "运行时长",
      value: dashboard.value.application.runtime,
      sub: `${dashboard.value.application.name} · ${dashboard.value.application.version}`,
      icon: "Clock",
      iconColor: "#0f766e",
      iconBg: "#dff7f4",
    },
    {
      label: "CPU 使用",
      value: `${getMetricValue("cpu")}%`,
      sub: `CPU 核心数 ${dashboard.value.server.cpuCores}`,
      icon: "TrendCharts",
      iconColor: "#ea580c",
      iconBg: "#fff1e6",
    },
    {
      label: "JVM 堆",
      value: `${getJvmHeapUsagePercent()}%`,
      sub: `线程数 ${dashboard.value.jvm.threadCount}`,
      icon: "DataAnalysis",
      iconColor: "#7c3aed",
      iconBg: "#f3ebff",
    },
  ]);

  const healthItems = computed(() => [
    {
      name: "应用服务",
      shortName: "AP",
      detail: `端口 ${dashboard.value.application.port} · 启动于 ${dashboard.value.application.startTime}`,
      statusText: statusMeta.value.text,
      tagType: statusMeta.value.type,
      color: "#2563eb",
    },
    {
      name: "数据源",
      shortName: "DB",
      detail: `${dashboard.value.database.type} · ${dashboard.value.database.host}:${dashboard.value.database.port} / ${dashboard.value.database.database}`,
      statusText: dashboard.value.health.datasourceStatus === "UP" ? "正常" : "异常",
      tagType: dashboard.value.health.datasourceStatus === "UP" ? "success" : "danger",
      color: "#ea580c",
    },
    {
      name: "Redis",
      shortName: "RD",
      detail: `${dashboard.value.redis.host}:${dashboard.value.redis.port} · DB ${dashboard.value.redis.database}`,
      statusText: dashboard.value.redis.status === "UP" ? "正常" : "异常",
      tagType: dashboard.value.redis.status === "UP" ? "success" : "danger",
      color: "#7c3aed",
    },
    {
      name: "主机资源",
      shortName: "OS",
      detail: `${dashboard.value.server.os} · ${dashboard.value.server.cpuCores} 核`,
      statusText: dashboard.value.health.overallStatus === "UP" ? "正常" : "关注",
      tagType: dashboard.value.health.overallStatus === "UP" ? "success" : "warning",
      color: "#0f766e",
    },
  ]);

  const resourceItems = computed(() => [
    {
      label: "CPU 使用",
      value: getMetricValue("cpu"),
      note: "近 8 个采样点",
      color: "#2563eb",
      trend: getTrendDisplaySeries(dashboard.value.metrics.cpu),
    },
    {
      label: "内存使用",
      value: getMetricValue("memory"),
      note: "堆外与系统内存合并展示",
      color: "#7c3aed",
      trend: getTrendDisplaySeries(dashboard.value.metrics.memory),
    },
    {
      label: "磁盘使用",
      value: getMetricValue("disk"),
      note: "整体磁盘占用情况",
      color: "#ea580c",
      trend: getTrendDisplaySeries(dashboard.value.metrics.disk),
    },
  ]);

  const jvmItems = computed(() => [
    {
      label: "堆已用",
      value: formatBytes(dashboard.value.jvm.heapUsedBytes),
      desc: `占比 ${getJvmHeapUsagePercent()}%`,
      percentage: getJvmHeapUsagePercent(),
      color: "#7c3aed",
    },
    {
      label: "堆提交",
      value: formatBytes(dashboard.value.jvm.heapCommittedBytes),
      desc: `最大 ${formatBytes(dashboard.value.jvm.heapMaxBytes)}`,
    },
    {
      label: "线程数",
      value: String(dashboard.value.jvm.threadCount),
      desc: "当前活动线程总数",
    },
  ]);

  const summaryItems = computed(() => [
    { name: "hostName", label: "主机", value: dashboard.value.server.hostName },
    { name: "ip", label: "IP 地址", value: dashboard.value.server.ip },
    { name: "os", label: "系统", value: dashboard.value.server.os },
    { name: "runtime", label: "运行时长", value: dashboard.value.application.runtime },
    { name: "appVersion", label: "应用版本", value: dashboard.value.application.version },
  ]);

  const configItems = computed(() => dashboard.value.config);

  async function loadDashboardData() {
    startLoading();
    try {
      await loadFullDashboard();
    } finally {
      endLoading();
      startRealtime(requestSection);
    }
  }

  async function handleRefresh() {
    await loadDashboardData();
    ElMessage.success("监控数据已刷新");
  }

  onMounted(() => {
    loadDashboardData();
  });

  onUnmounted(() => {
    stopAll();
  });

  return {
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
  };
}
