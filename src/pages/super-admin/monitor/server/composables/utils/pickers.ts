/**
 * 返回第一个非空（非 undefined/null/''）的参数值
 */
export function pickFirst<T>(...values: T[]): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

/**
 * 从 API 响应中解包实际数据（处理常见的 { data: ... } 结构）
 */
export function unwrapApiPayload(response: any): any {
  const body = response?.data;
  if (body && typeof body === "object" && "data" in body) {
    return body.data ?? {};
  }
  return body ?? {};
}
