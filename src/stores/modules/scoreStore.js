import { defineStore } from "pinia";
import { ScoringApi } from "@/api/scoring";

const DEFAULT_SCORE_STANDARD_CACHE_TTL = 60 * 60 * 1000; // 60 minutes
const DEFAULT_RECORD_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// localStorage key: app + version + user + cache-type
const SCORE_CACHE_STORAGE_PREFIX = "game-evaluate:score-cache:v1";
const SCORE_STD_STORAGE_SUFFIX = "score-standards";
const SCORE_RECORD_STORAGE_SUFFIX = "scoring-records";

export const useScoreStore = defineStore("scoreStore", () => {
  // L1 caches: memory maps used directly by business pages
  const scoreStdsCache = new Map();
  const scoreStdRequestMap = new Map();
  const scoringRecordsCache = new Map();
  // Current user's storage keys (L2 namespace)
  let currentScoreStdStorageKey = "";
  let currentScoreRecordStorageKey = "";

  const normalizeId = (id) => {
    const normalizedId = Number(id);
    return Number.isFinite(normalizedId) && normalizedId > 0 ? normalizedId : null;
  };

  const makeRecordKey = (projectId, groupId) => {
    const pId = normalizeId(projectId);
    const gId = normalizeId(groupId);
    if (!pId || !gId) return null;
    return `${pId}:${gId}`;
  };

  const resolveTtlMs = (ttlMs, defaultTtlMs) => {
    const normalizedTtl = Number(ttlMs);
    return Number.isFinite(normalizedTtl) && normalizedTtl > 0
      ? normalizedTtl
      : defaultTtlMs;
  };

  const canUseStorage = () =>
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  const getCurrentUserId = () => {
    if (!canUseStorage()) return "guest";
    try {
      const userInfoText = window.localStorage.getItem("userInfo");
      const userInfo = userInfoText ? JSON.parse(userInfoText) : null;
      const userId = normalizeId(userInfo?.id);
      return userId ? String(userId) : "guest";
    } catch {
      return "guest";
    }
  };

  const buildStorageKey = (suffix) =>
    `${SCORE_CACHE_STORAGE_PREFIX}:${getCurrentUserId()}:${suffix}`;

  const isCacheEntryValid = (cacheEntry) =>
    !!cacheEntry && Number(cacheEntry.expiredAt) > Date.now();

  const pruneExpiredEntries = (cacheMap) => {
    for (const [cacheKey, cacheEntry] of cacheMap.entries()) {
      if (!isCacheEntryValid(cacheEntry)) {
        cacheMap.delete(cacheKey);
      }
    }
  };

  const readCacheMapFromStorage = (storageKey, targetMap) => {
    if (!canUseStorage()) return;
    const rawText = window.localStorage.getItem(storageKey);
    if (!rawText) return;

    try {
      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      parsed.forEach((item) => {
        if (!Array.isArray(item) || item.length !== 2) return;
        const [cacheKey, cacheEntry] = item;
        // Load only valid entries; expired data is dropped immediately
        if (isCacheEntryValid(cacheEntry)) {
          targetMap.set(cacheKey, cacheEntry);
        }
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  };

  const writeCacheMapToStorage = (storageKey, cacheMap) => {
    if (!canUseStorage()) return;
    pruneExpiredEntries(cacheMap);

    if (cacheMap.size === 0) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    try {
      // Persist Map as JSON array entries
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(cacheMap.entries()))
      );
    } catch (error) {
      console.warn("write score cache to localStorage failed:", error);
    }
  };

  const syncPersistedCaches = () => {
    if (!canUseStorage()) return;
    writeCacheMapToStorage(currentScoreStdStorageKey, scoreStdsCache);
    writeCacheMapToStorage(currentScoreRecordStorageKey, scoringRecordsCache);
  };

  const ensureHydrated = () => {
    const nextScoreStdStorageKey = buildStorageKey(SCORE_STD_STORAGE_SUFFIX);
    const nextScoreRecordStorageKey = buildStorageKey(SCORE_RECORD_STORAGE_SUFFIX);

    if (
      nextScoreStdStorageKey === currentScoreStdStorageKey &&
      nextScoreRecordStorageKey === currentScoreRecordStorageKey
    ) {
      return;
    }

    // User changed (or first init): switch namespace and reload L2 -> L1
    scoreStdsCache.clear();
    scoringRecordsCache.clear();
    scoreStdRequestMap.clear();

    currentScoreStdStorageKey = nextScoreStdStorageKey;
    currentScoreRecordStorageKey = nextScoreRecordStorageKey;
    readCacheMapFromStorage(currentScoreStdStorageKey, scoreStdsCache);
    readCacheMapFromStorage(currentScoreRecordStorageKey, scoringRecordsCache);
  };

  /**
   * 设置打分标准缓存
   * @param {Number|String} stdId
   * @param {Object} standardDetail
   * @param {Number} ttlMs
   */
  function setScoreStdCache(stdId, standardDetail, ttlMs = DEFAULT_SCORE_STANDARD_CACHE_TTL) {
    ensureHydrated();
    const normalizedStdId = normalizeId(stdId);
    if (!normalizedStdId) return null;

    const effectiveTtlMs = resolveTtlMs(ttlMs, DEFAULT_SCORE_STANDARD_CACHE_TTL);

    const fetchedAt = Date.now();
    scoreStdsCache.set(normalizedStdId, {
      data: standardDetail,
      fetchedAt,
      expiredAt: fetchedAt + effectiveTtlMs,
    });
    // Sync to L2 persistence
    writeCacheMapToStorage(currentScoreStdStorageKey, scoreStdsCache);
    return standardDetail;
  }

  function getScoreStdCacheEntry(stdId) {
    ensureHydrated();
    const normalizedStdId = normalizeId(stdId);
    if (!normalizedStdId) return null;
    return scoreStdsCache.get(normalizedStdId) || null;
  }

  function getScoreStdCache(stdId, options = {}) {
    ensureHydrated();
    const { allowExpired = false } = options;
    const normalizedStdId = normalizeId(stdId);
    if (!normalizedStdId) return null;
    const cacheEntry = scoreStdsCache.get(normalizedStdId) || null;
    if (!cacheEntry) return null;
    if (!allowExpired && cacheEntry.expiredAt <= Date.now()) {
      // Lazy cleanup on read
      scoreStdsCache.delete(normalizedStdId);
      writeCacheMapToStorage(currentScoreStdStorageKey, scoreStdsCache);
      return null;
    }
    return cacheEntry.data;
  }

  function isScoreStdCacheValid(stdId) {
    const cacheEntry = getScoreStdCacheEntry(stdId);
    return !!cacheEntry && cacheEntry.expiredAt > Date.now();
  }

  function clearScoreStdCache(stdId) {
    ensureHydrated();
    if (stdId === undefined || stdId === null) {
      scoreStdsCache.clear();
      scoreStdRequestMap.clear();
      writeCacheMapToStorage(currentScoreStdStorageKey, scoreStdsCache);
      return;
    }

    const normalizedStdId = normalizeId(stdId);
    if (!normalizedStdId) return;
    scoreStdsCache.delete(normalizedStdId);
    scoreStdRequestMap.delete(normalizedStdId);
    writeCacheMapToStorage(currentScoreStdStorageKey, scoreStdsCache);
  }

  async function fetchScoreStandard(stdId, options = {}) {
    ensureHydrated();
    const { forceRefresh = false, ttlMs = DEFAULT_SCORE_STANDARD_CACHE_TTL } = options;
    const normalizedStdId = normalizeId(stdId);
    if (!normalizedStdId) return null;

    if (!forceRefresh) {
      const cachedScoreStd = getScoreStdCache(normalizedStdId);
      // Cache hit: no API call
      if (cachedScoreStd) return cachedScoreStd;
    }

    const pendingRequest = scoreStdRequestMap.get(normalizedStdId);
    // De-duplicate concurrent same-key requests
    if (pendingRequest) return pendingRequest;

    const requestTask = ScoringApi.getScoringStandardsDetails(normalizedStdId)
      .then((response) => {
        if (response?.code !== 200 || !response?.data) {
          throw new Error(response?.message || "获取打分标准详情失败");
        }
        // Write-back into both memory and localStorage
        setScoreStdCache(normalizedStdId, response.data, ttlMs);
        return response.data;
      })
      .finally(() => {
        scoreStdRequestMap.delete(normalizedStdId);
      });

    scoreStdRequestMap.set(normalizedStdId, requestTask);
    return requestTask;
  }

  function setScoringRecordsCache(
    projectId,
    groupId,
    records,
    ttlMs = DEFAULT_RECORD_CACHE_TTL
  ) {
    ensureHydrated();
    const recordKey = makeRecordKey(projectId, groupId);
    if (!recordKey) return null;

    const effectiveTtlMs = resolveTtlMs(ttlMs, DEFAULT_RECORD_CACHE_TTL);

    const fetchedAt = Date.now();
    scoringRecordsCache.set(recordKey, {
      data: records,
      fetchedAt,
      expiredAt: fetchedAt + effectiveTtlMs,
    });
    // Sync to L2 persistence
    writeCacheMapToStorage(currentScoreRecordStorageKey, scoringRecordsCache);
    return records;
  }

  function getScoringRecordsCache(projectId, groupId, options = {}) {
    ensureHydrated();
    const { allowExpired = false } = options;
    const recordKey = makeRecordKey(projectId, groupId);
    if (!recordKey) return null;

    const cacheEntry = scoringRecordsCache.get(recordKey);
    if (!cacheEntry) return null;
    if (!allowExpired && cacheEntry.expiredAt <= Date.now()) {
      // Lazy cleanup on read
      scoringRecordsCache.delete(recordKey);
      writeCacheMapToStorage(currentScoreRecordStorageKey, scoringRecordsCache);
      return null;
    }
    return cacheEntry.data;
  }

  function clearScoringRecordsCache(projectId, groupId) {
    ensureHydrated();
    if (projectId === undefined || projectId === null) {
      scoringRecordsCache.clear();
      writeCacheMapToStorage(currentScoreRecordStorageKey, scoringRecordsCache);
      return;
    }

    const normalizedProjectId = normalizeId(projectId);
    if (!normalizedProjectId) return;

    if (groupId === undefined || groupId === null) {
      // projectId only: clear all group-level caches under this project
      const projectKeyPrefix = `${normalizedProjectId}:`;
      for (const key of scoringRecordsCache.keys()) {
        if (key.startsWith(projectKeyPrefix)) {
          scoringRecordsCache.delete(key);
        }
      }
      writeCacheMapToStorage(currentScoreRecordStorageKey, scoringRecordsCache);
      return;
    }

    const recordKey = makeRecordKey(normalizedProjectId, groupId);
    if (!recordKey) return;
    scoringRecordsCache.delete(recordKey);
    writeCacheMapToStorage(currentScoreRecordStorageKey, scoringRecordsCache);
  }

  // store 创建时就同步一次当前用户的持久化缓存
  ensureHydrated();
  // Also normalize storage content (remove expired entries and rewrite)
  syncPersistedCaches();

  return {
    DEFAULT_SCORE_STANDARD_CACHE_TTL,
    DEFAULT_RECORD_CACHE_TTL,
    scoreStdsCache,
    scoringRecordsCache,
    setScoreStdCache,
    getScoreStdCache,
    isScoreStdCacheValid,
    clearScoreStdCache,
    fetchScoreStandard,
    setScoringRecordsCache,
    getScoringRecordsCache,
    clearScoringRecordsCache,
  };
});
