import { monitorApi } from "@/api/monitor";
import { unwrapApiPayload } from "../utils/pickers";

type ApplySectionFn = (section: string, payload: any) => void;

export function useMonitorApi(applySection: ApplySectionFn) {
  async function requestSection(section: string): Promise<boolean> {
    try {
      const apiMap: Record<string, any> = {
        overview: monitorApi.getOverview,
        health: monitorApi.getHealth,
        datasource: monitorApi.getDataSource,
        redis: monitorApi.getRedis,
        jvm: monitorApi.getJvm,
        os: monitorApi.getOs,
        config: monitorApi.getConfig,
        logs: monitorApi.getLogs,
      };
      const response =
        section === "logs" ? await apiMap[section]({ limit: 5 }) : await apiMap[section]();
      applySection(section, unwrapApiPayload(response));
      return true;
    } catch {
      return false;
    }
  }

  async function loadFallbackSections() {
    await Promise.allSettled([
      requestSection("overview"),
      requestSection("health"),
      requestSection("datasource"),
      requestSection("redis"),
      requestSection("jvm"),
      requestSection("os"),
      requestSection("config"),
      requestSection("logs"),
    ]);
  }

  async function loadDashboardData() {
    try {
      const response = await monitorApi.getDashboard();
      applySection("dashboard", unwrapApiPayload(response));
      return true;
    } catch {
      await loadFallbackSections();
      return false;
    }
  }

  return {
    requestSection,
    loadDashboardData,
    loadFallbackSections,
  };
}
