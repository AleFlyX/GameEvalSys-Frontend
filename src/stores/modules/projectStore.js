import { defineStore } from "pinia";
import { projectApi } from "@/api/project";
import { useUserStore } from "./userStore";

const DEFAULT_PROJECT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// localStorage key: app + version + user + cache-type
const PROJECT_CACHE_STORAGE_PREFIX = "game-evaluate:project-cache:v1";
const PROJECT_CACHE_STORAGE_SUFFIX = "project-details";

const userStore = useUserStore();

export const useProjectStore = defineStore("projectStore", () => {
  // L1 cache: in-memory Map (fastest read path)
  const projectDataCache = new Map();
  // Request de-duplication: same projectId concurrent calls share one Promise
  const projectRequestMap = new Map();
  // Current user's persistence key, resolved lazily
  let currentProjectStorageKey = "";

  const normalizeProjectId = (projectId) => {
    const id = Number(projectId);
    return Number.isFinite(id) && id > 0 ? id : null;
  };

  const canUseStorage = () =>
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  const getCurrentUserId = () => {
    if (!canUseStorage() || !userStore.isLogin) return "guest";
    try {
      // const userInfoText = window.localStorage.getItem("userInfo");
      // const userInfo = userInfoText ? JSON.parse(userInfoText) : null;
      // const userId = normalizeProjectId(userInfo?.id);
      const userId = normalizeProjectId(userStore.userInfo?.id);
      return userId ? String(userId) : "guest";
    } catch {
      return "guest";
    }
  };

  const buildStorageKey = () =>
    `${PROJECT_CACHE_STORAGE_PREFIX}:${getCurrentUserId()}:${PROJECT_CACHE_STORAGE_SUFFIX}`;

  const isCacheEntryValid = (cacheEntry) =>
    !!cacheEntry && Number(cacheEntry.expiredAt) > Date.now();

  const pruneExpiredEntries = () => {
    for (const [cacheKey, cacheEntry] of projectDataCache.entries()) {
      if (!isCacheEntryValid(cacheEntry)) {
        projectDataCache.delete(cacheKey);
      }
    }
  };

  const readCacheFromStorage = (storageKey) => {
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
        // Load only non-expired entries into L1
        if (isCacheEntryValid(cacheEntry)) {
          projectDataCache.set(cacheKey, cacheEntry);
        }
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  };

  const writeCacheToStorage = () => {
    if (!canUseStorage()) return;
    pruneExpiredEntries();

    if (!currentProjectStorageKey) return;
    if (projectDataCache.size === 0) {
      window.localStorage.removeItem(currentProjectStorageKey);
      return;
    }

    try {
      // Map is serialized as array of [key, value] pairs
      window.localStorage.setItem(
        currentProjectStorageKey,
        JSON.stringify(Array.from(projectDataCache.entries()))
      );
    } catch (error) {
      console.warn("write project cache to localStorage failed:", error);
    }
  };

  const ensureHydrated = () => {
    const nextStorageKey = buildStorageKey();
    if (nextStorageKey === currentProjectStorageKey) return;

    // User changed (or first init): switch persistence namespace and reload
    projectDataCache.clear();
    projectRequestMap.clear();
    currentProjectStorageKey = nextStorageKey;
    readCacheFromStorage(currentProjectStorageKey);
  };

  function setProjectDetails(projectDetail, ttlMs = DEFAULT_PROJECT_CACHE_TTL) {
    ensureHydrated();
    const projectId = normalizeProjectId(projectDetail?.id);
    if (!projectId) return null;

    const fetchedAt = Date.now();
    projectDataCache.set(projectId, {
      data: projectDetail,
      fetchedAt,
      expiredAt: fetchedAt + ttlMs,
    });
    // Sync L1 -> L2
    writeCacheToStorage();
    return projectDetail;
  }

  function getProjectCacheEntry(projectId) {
    ensureHydrated();
    const normalizedId = normalizeProjectId(projectId);
    if (!normalizedId) return null;
    const cacheEntry = projectDataCache.get(normalizedId) || null;
    if (cacheEntry && cacheEntry.expiredAt <= Date.now()) {
      // Lazy cleanup: remove expired entry when read
      projectDataCache.delete(normalizedId);
      writeCacheToStorage();
      return null;
    }
    return cacheEntry;
  }

  function isProjectCacheValid(projectId) {
    const cacheEntry = getProjectCacheEntry(projectId);
    return !!cacheEntry && cacheEntry.expiredAt > Date.now();
  }

  function getProjectDetails(projectId, options = {}) {
    const { allowExpired = false } = options;
    const cacheEntry = getProjectCacheEntry(projectId);
    if (!cacheEntry) return null;
    if (!allowExpired && cacheEntry.expiredAt <= Date.now()) return null;
    return cacheEntry.data;
  }

  function clearProjectCache(projectId) {
    ensureHydrated();
    if (projectId === undefined || projectId === null) {
      projectDataCache.clear();
      projectRequestMap.clear();
      writeCacheToStorage();
      return;
    }

    const normalizedId = normalizeProjectId(projectId);
    if (!normalizedId) return;
    projectDataCache.delete(normalizedId);
    projectRequestMap.delete(normalizedId);
    writeCacheToStorage();
  }

  async function fetchProjectDetails(projectId, options = {}) {
    ensureHydrated();
    const { forceRefresh = false, ttlMs = DEFAULT_PROJECT_CACHE_TTL } = options;
    const normalizedId = normalizeProjectId(projectId);
    if (!normalizedId) return null;

    if (!forceRefresh) {
      const cachedProject = getProjectDetails(normalizedId);
      // Cache hit: skip network
      if (cachedProject) return cachedProject;
    }

    const pendingRequest = projectRequestMap.get(normalizedId);
    // Same key currently loading: reuse inflight Promise
    if (pendingRequest) return pendingRequest;

    const requestTask = projectApi.getProjectDetail(normalizedId)
      .then((response) => {
        if (response?.code !== 200 || !response?.data) {
          throw new Error(response?.message || "获取项目详情失败");
        }
        // Successful network response is written back into both L1/L2
        setProjectDetails(response.data, ttlMs);
        return response.data;
      })
      .finally(() => {
        projectRequestMap.delete(normalizedId);
      });

    projectRequestMap.set(normalizedId, requestTask);
    return requestTask;
  }

  ensureHydrated();
  writeCacheToStorage();

  return {
    DEFAULT_PROJECT_CACHE_TTL,
    projectDataCache,
    setProjectDetails,
    getProjectDetails,
    isProjectCacheValid,
    clearProjectCache,
    fetchProjectDetails,
  };
});
