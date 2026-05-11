/**
 * 将秒数格式化为可读的运行时长字符串（天/小时/分钟）
 */
export function formatUptime(seconds: number): string {
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0 分钟";
  }
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0 || parts.length) parts.push(`${hours}小时`);
  parts.push(`${minutes}分钟`);
  return parts.join(" ");
}

/**
 * 格式化当前时间为本地日期时间字符串（zh-CN）
 */
export function formatNow(): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * 将字节数格式化为可读字符串（B/KB/MB/GB/TB）
 */
export function formatBytes(bytes: number): string {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  return `${size >= 100 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
}
