import { ref, onUnmounted } from "vue";
import { monitorApi } from "@/api/monitor";

const POLL_INTERVAL = 15000;
const RECONNECT_DELAY = 5000;
const MAX_STREAM_RETRY = 3;

type ApplySectionFn = (section: string, payload: any) => void;
type RequestSectionFn = (section: string) => Promise<boolean>;

export function useRealtimeMonitor(applySection: ApplySectionFn, onFallbackStart?: () => void) {
  const connectionStatus = ref<"connecting" | "open" | "reconnecting" | "fallback">("connecting");
  const realtimeMode = ref<"idle" | "sse" | "polling">("idle");
  const retryCount = ref(0);
  const pollTick = ref(0);

  let streamSource: EventSource | null = null;
  let pollTimer: number | null = null;
  let reconnectTimer: number | null = null;

  function stopStream() {
    if (streamSource) {
      streamSource.close();
      streamSource = null;
    }
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function parseStreamPayload(event: MessageEvent): any {
    const raw = event?.data;
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return { message: String(raw) };
    }
  }

  function handleStreamEvent(eventName: string, event: MessageEvent) {
    applySection(eventName, parseStreamPayload(event));
    connectionStatus.value = "open";
    realtimeMode.value = "sse";
    retryCount.value = 0;
  }

  function handleStreamFailure(requestSection: RequestSectionFn) {
    if (realtimeMode.value === "polling") return;
    stopStream();
    stopPolling();
    retryCount.value += 1;
    if (retryCount.value >= MAX_STREAM_RETRY) {
      startPolling(requestSection);
      return;
    }
    connectionStatus.value = "reconnecting";
    reconnectTimer = window.setTimeout(() => {
      connectStream(requestSection);
    }, RECONNECT_DELAY);
  }

  function connectStream(requestSection: RequestSectionFn) {
    if (typeof window === "undefined" || typeof window.EventSource !== "function") {
      startPolling(requestSection);
      return;
    }
    stopStream();
    stopPolling();
    try {
      connectionStatus.value = retryCount.value > 0 ? "reconnecting" : "connecting";
      const source = new EventSource(monitorApi.getStreamUrl(), { withCredentials: true });
      streamSource = source;
      source.addEventListener("open", () => {
        connectionStatus.value = "open";
        realtimeMode.value = "sse";
        retryCount.value = 0;
      });
      [
        "overview",
        "health",
        "datasource",
        "redis",
        "jvm",
        "os",
        "config",
        "logs",
        "dashboard",
      ].forEach((eventName) => {
        source.addEventListener(eventName, (event: MessageEvent) =>
          handleStreamEvent(eventName, event),
        );
      });
      source.onerror = () => handleStreamFailure(requestSection);
    } catch {
      startPolling(requestSection);
    }
  }

  async function runPollingTick(
    withLowFrequency: boolean,
    requestSection: (section: string) => Promise<boolean>,
  ) {
    const tasks = [requestSection("health"), requestSection("jvm"), requestSection("os")];
    if (withLowFrequency) {
      tasks.push(
        requestSection("overview"),
        requestSection("datasource"),
        requestSection("redis"),
        requestSection("config"),
        requestSection("logs"),
      );
    }
    await Promise.allSettled(tasks);
  }

  function startPolling(requestSection: RequestSectionFn) {
    stopStream();
    stopPolling();
    realtimeMode.value = "polling";
    connectionStatus.value = "fallback";
    retryCount.value = 0;
    runPollingTick(true, requestSection);
    pollTimer = window.setInterval(() => {
      pollTick.value += 1;
      runPollingTick(pollTick.value % 4 === 0, requestSection);
    }, POLL_INTERVAL);
    onFallbackStart?.();
  }

  function startRealtime(requestSection: (section: string) => Promise<boolean>) {
    if (typeof window === "undefined") return;
    if (typeof window.EventSource !== "function") {
      startPolling(requestSection);
      return;
    }
    connectStream(requestSection);
  }

  function stopAll() {
    stopStream();
    stopPolling();
  }

  return {
    connectionStatus,
    realtimeMode,
    startRealtime,
    stopAll,
  };
}
