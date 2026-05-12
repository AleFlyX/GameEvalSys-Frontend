import type { ComputedRef } from "vue";

export declare function useLoading(key?: string): {
  isLoading: ComputedRef<boolean>;
  isSkeleton: ComputedRef<boolean>;
  start: () => void;
  end: () => void;
  requestWithLoading: <T>(fn: (...args: any[]) => Promise<T>, ...args: any[]) => Promise<T>;
};
