import { pickFirst } from "../utils/pickers";
import { formatNow } from "../utils/formatters";
import { normalizeText } from "../utils/normalizers";
import type { ConfigItem, LogItem } from "./types";

/**
 * 规范化配置列表
 */
export function normalizeConfigList(raw: any, fallback: any[] = []): ConfigItem[] {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return [
      { label: "datasourceUrlMasked", value: normalizeText(raw.datasourceUrlMasked, "-") },
      {
        label: "datasourceHost",
        value: normalizeText(
          raw.datasourcePort !== undefined
            ? `${normalizeText(raw.datasourceHost, "-")}:${normalizeText(raw.datasourcePort, "-")}`
            : normalizeText(raw.datasourceHost, "-"),
          "-",
        ),
      },
      { label: "datasourceDatabase", value: normalizeText(raw.datasourceDatabase, "-") },
      {
        label: "datasourceDriverClassName",
        value: normalizeText(raw.datasourceDriverClassName, "-"),
      },
      {
        label: "datasourceUsernameMasked",
        value: normalizeText(raw.datasourceUsernameMasked, "-"),
      },
      {
        label: "redisHost",
        value: normalizeText(
          raw.redisPort !== undefined
            ? `${normalizeText(raw.redisHost, "-")}:${normalizeText(raw.redisPort, "-")}`
            : normalizeText(raw.redisHost, "-"),
          "-",
        ),
      },
      { label: "redisDatabase", value: normalizeText(raw.redisDatabase, "-") },
      { label: "redisTimeoutMillis", value: normalizeText(raw.redisTimeoutMillis, "-") },
      { label: "redisPoolMaxActive", value: normalizeText(raw.redisPoolMaxActive, "-") },
      { label: "redisPoolMaxIdle", value: normalizeText(raw.redisPoolMaxIdle, "-") },
      { label: "redisPoolMinIdle", value: normalizeText(raw.redisPoolMinIdle, "-") },
      { label: "redisPoolMaxWaitMillis", value: normalizeText(raw.redisPoolMaxWaitMillis, "-") },
      { label: "server.port", value: normalizeText(raw.serverPort, "-") },
      { label: "timeZone", value: normalizeText(raw.timeZone, "-") },
      { label: "cacheSchedulerEnabled", value: String(raw.cacheSchedulerEnabled) },
    ].filter((item) => item.value && item.value !== "-");
  }
  return fallback;
}

/**
 * 规范化日志列表，截取前5条
 */
export function normalizeLogList(raw: any, fallback: any[] = []): LogItem[] {
  if (!Array.isArray(raw) || !raw.length) return fallback;
  return raw
    .slice(0, 5)
    .map((item) => ({
      time: normalizeText(item?.time, formatNow()),
      level: normalizeText(item?.level, "INFO").toUpperCase(),
      content: normalizeText(item?.content, ""),
    }))
    .filter((item) => item.content);
}
