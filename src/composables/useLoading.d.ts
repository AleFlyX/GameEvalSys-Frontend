import type { ComputedRef } from "vue";

export declare function useLoading(
  key?: string,
  showLoadingGap?: number,
  showSkeletonGap?: number,
): {
  isLoading: ComputedRef<boolean>;
  isSkeleton: ComputedRef<boolean>;
  start: () => void;
  end: () => void;
  requestWithLoading: <T>(fn: (...args: any[]) => Promise<T>, ...args: any[]) => Promise<T>;
};
