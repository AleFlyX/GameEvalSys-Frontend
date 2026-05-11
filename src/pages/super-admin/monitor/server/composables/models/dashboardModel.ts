import { formatNow, formatUptime } from "../utils/formatters";
import {
  normalizeStatus,
  normalizeText,
  normalizeOsLabel,
  normalizeSeries,
} from "../utils/normalizers";
import { normalizeJvmPayload } from "./jvmModel";
import { normalizeConfigList, normalizeLogList } from "./configModel";
import type { DashboardModel } from "./types";

export function createMockDashboard(): DashboardModel {
  return {
    summary: {
      status: "WARN",
      message: "--",
      updatedAt: formatNow(),
      source: "local",
    },
    application: {
      name: "课题项目打分系统",
      version: "--",
      port: 0,
      startTime: "--",
      runtime: "--",
    },
    server: {
      hostName: "--",
      ip: "--",
      os: "--",
      cpuCores: 0,
    },
    database: {
      type: "--",
      host: "--",
      port: 0,
      database: "--",
      status: "offline",
      latencyMs: 0,
    },
    redis: {
      host: "--",
      port: 0,
      database: 0,
      status: "offline",
      latencyMs: 3,
    },
    jvm: {
      heapUsedBytes: 0,
      heapCommittedBytes: 0,
      heapMaxBytes: 0,
      threadCount: 0,
    },
    health: {
      overallStatus: "--",
      datasourceStatus: "--",
      redisStatus: "--",
      message: "offline",
    },
    metrics: {
      cpu: [18, 22, 20, 24, 23, 21, 26, 0],
      memory: [52, 54, 56, 59, 60, 61, 62, 0],
      disk: [44, 44, 45, 45, 46, 46, 46, 0],
    },
    loadAverage: ["0.00", "0.00", "0.00"],
    config: [
      { label: "server.port", value: "--" },
      { label: "时区", value: "Asia/Shanghai" },
      { label: "数据库", value: "--" },
      { label: "Redis", value: "--:6379 / DB 0" },
      { label: "cacheSchedulerEnabled", value: "--" },
    ],
    logs: [],
  };
}

export function normalizeDashboard(raw: any = {}): DashboardModel {
  const payload = raw && typeof raw === "object" ? raw : {};
  const base = createMockDashboard();
  const overview = payload.overview || {};
  const health = payload.health || {};
  const datasource = payload.datasource || {};
  const redis = payload.redis || {};
  const jvm = payload.jvm || {};
  const os = payload.os || {};
  const config = payload.config || {};
  const logs = payload.logs || [];

  return {
    summary: {
      ...base.summary,
      status: normalizeStatus(health.overallStatus, base.summary.status),
      message: normalizeText(health.message, base.summary.message),
      updatedAt: normalizeText(payload.generatedAt, formatNow()),
      source: "remote",
    },
    application: {
      ...base.application,
      version: normalizeText(overview.appVersion, base.application.version),
      port: Number(overview.serverPort) || base.application.port,
      startTime: normalizeText(overview.startTime, base.application.startTime),
      runtime: normalizeText(
        overview.uptimeText,
        formatUptime(Number(overview.uptimeMillis || 0) / 1000),
      ),
    },
    server: {
      ...base.server,
      hostName: normalizeText(overview.hostName, base.server.hostName),
      ip: normalizeText(overview.hostAddress, base.server.ip),
      os: normalizeOsLabel(
        {
          osName: os.osName,
          osVersion: os.osVersion,
          osArch: os.osArch,
        },
        base.server.os,
      ),
      cpuCores: Number(os.availableProcessors) || base.server.cpuCores,
    },
    database: {
      ...base.database,
      type: normalizeText(datasource.jdbcType, base.database.type),
      host: normalizeText(config.datasourceHost, base.database.host),
      port: Number(config.datasourcePort) || base.database.port,
      database: normalizeText(config.datasourceDatabase, base.database.database),
      status: normalizeStatus(datasource.status, base.database.status),
    },
    redis: {
      ...base.redis,
      host: normalizeText(redis.host, base.redis.host),
      port: Number(redis.port) || base.redis.port,
      database: Number(redis.database) || base.redis.database,
      status: normalizeStatus(redis.status, base.redis.status),
    },
    jvm: normalizeJvmPayload(jvm),
    health: {
      ...base.health,
      overallStatus: normalizeStatus(health.overallStatus, base.health.overallStatus),
      datasourceStatus: normalizeStatus(health.datasourceStatus, base.health.datasourceStatus),
      redisStatus: normalizeStatus(health.redisStatus, base.health.redisStatus),
      message: normalizeText(health.message, base.health.message),
    },
    metrics: {
      cpu: normalizeSeries(
        os.systemCpuLoadPercent !== undefined ? [os.systemCpuLoadPercent] : base.metrics.cpu,
      ),
      memory: normalizeSeries(
        os.memoryUsagePercent !== undefined ? [os.memoryUsagePercent] : base.metrics.memory,
      ),
      disk: normalizeSeries(
        os.diskUsagePercent !== undefined ? [os.diskUsagePercent] : base.metrics.disk,
      ),
    },
    loadAverage: base.loadAverage,
    config: normalizeConfigList(config, base.config),
    logs: normalizeLogList(logs, base.logs),
  };
}
