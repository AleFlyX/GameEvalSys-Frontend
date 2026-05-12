import { normalizeBytes } from "../utils/normalizers";

export interface JvmPayload {
  heapUsedBytes: number;
  heapCommittedBytes: number;
  heapMaxBytes: number;
  threadCount: number;
}

/**
 * 规范 JVM 负载数据，提取堆内存和线程数
 */
export function normalizeJvmPayload(raw: any = {}): JvmPayload {
  return {
    heapUsedBytes: normalizeBytes(raw.heapUsedBytes, 0),
    heapCommittedBytes: normalizeBytes(raw.heapCommittedBytes, 0),
    heapMaxBytes: normalizeBytes(raw.heapMaxBytes, 0),
    threadCount: Number(raw.threadCount) || 0,
  };
}
