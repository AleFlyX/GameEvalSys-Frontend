export interface DashboardSummary {
  status: string;
  message: string;
  updatedAt: string;
  source: string;
}

export interface DashboardApplication {
  name: string;
  version: string;
  port: number;
  startTime: string;
  runtime: string;
}

export interface DashboardServer {
  hostName: string;
  ip: string;
  os: string;
  cpuCores: number;
}

export interface DashboardDatabase {
  type: string;
  host: string;
  port: number;
  database: string;
  status: string;
  latencyMs: number;
}

export interface DashboardRedis {
  host: string;
  port: number;
  database: number;
  status: string;
  latencyMs: number;
}

export interface ConfigItem {
  label: string;
  value: string;
}

export interface LogItem {
  time: string;
  level: string;
  content: string;
}

export interface JvmPayload {
  heapUsedBytes: number;
  heapCommittedBytes: number;
  heapMaxBytes: number;
  threadCount: number;
}

export interface DashboardModel {
  summary: DashboardSummary;
  application: DashboardApplication;
  server: DashboardServer;
  database: DashboardDatabase;
  redis: DashboardRedis;
  jvm: JvmPayload;
  health: {
    overallStatus: string;
    datasourceStatus: string;
    redisStatus: string;
    message: string;
  };
  metrics: {
    cpu: number[];
    memory: number[];
    disk: number[];
  };
  loadAverage: string[];
  config: ConfigItem[];
  logs: LogItem[];
}

export type MetricKey = keyof DashboardModel["metrics"];

export type MonitorSection =
  | "overview"
  | "health"
  | "datasource"
  | "redis"
  | "jvm"
  | "os"
  | "config"
  | "logs"
  | "dashboard";
