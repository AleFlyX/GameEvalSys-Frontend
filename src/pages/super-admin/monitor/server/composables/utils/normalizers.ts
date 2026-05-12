import { pickFirst } from "./pickers";
/**
 * 将原始状态字符串规范化为 'UP' / 'WARN' / 'DOWN'
 */
export function normalizeStatus(value: any, fallback: string = "UP"): "UP" | "WARN" | "DOWN" {
  const raw = String(value || fallback)
    .trim()
    .toLowerCase();
  if (["up", "ok", "running", "online", "healthy", "success"].includes(raw)) return "UP";
  if (["warn", "warning", "degraded", "partial"].includes(raw)) return "WARN";
  if (["down", "error", "fail", "failed", "offline", "unhealthy"].includes(raw)) return "DOWN";
  return fallback as any;
}

/**
 * 规范负载数组，确保返回长度为3的字符串数组
 */
export function normalizeLoadAverage(raw: any): string[] {
  if (!Array.isArray(raw) || raw.length < 3) {
    return ["0.00", "0.00", "0.00"];
  }
  return raw.slice(0, 3).map((item) => String(item));
}

/**
 * 将百分比值（小数或百分数）转换为保留一位小数的百分比数字
 */
export function toPercent(value: any): number | null {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num > 0 && num <= 1) return Number((num * 100).toFixed(1));
  return Number(num.toFixed(1));
}

/**
 * 将任意值规范化为字符串
 */
export function normalizeText(value: any, fallback: string = ""): string {
  const next = pickFirst(value, fallback);
  return next === undefined ? fallback : String(next);
}

/**
 * 将字节值规范化为数值
 */
export function normalizeBytes(value: any, fallback: number = 0): number {
  const num = Number(pickFirst(value, fallback) ?? fallback);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * 根据操作系统名称、版本、架构组合显示字符串
 */
export function formatOsLabel(
  osName?: string,
  osVersion?: string,
  osArch?: string,
  fallback: string = "",
): string {
  const name = normalizeText(osName, "");
  const version = normalizeText(osVersion, "");
  const arch = normalizeText(osArch, "");
  const base = [name, version].filter(Boolean).join(" ").trim();
  if (base && arch) return `${base} (${arch})`;
  if (base) return base;
  if (arch) return arch;
  return fallback;
}

/**
 * 规范操作系统标签，支持对象或字符串输入
 */
export function normalizeOsLabel(raw: any, fallback: string = ""): string {
  if (raw && typeof raw === "object") {
    return formatOsLabel(raw.osName, raw.osVersion, raw.osArch, fallback);
  }
  return normalizeText(raw, fallback);
}

/**
 * 规范指标序列，确保所有值在 [0,100] 范围内且保留一位小数
 */
export function normalizeSeries(series: any): number[] {
  if (!Array.isArray(series) || !series.length) return [];
  return series.map((item) => {
    if (typeof item === "number") {
      return Math.max(0, Math.min(100, Number(item.toFixed(1))));
    }
    if (item && typeof item === "object") {
      const value = Number(item.value ?? item.percent ?? item.y ?? 0);
      return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    }
    const value = Number(item);
    return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  });
}
