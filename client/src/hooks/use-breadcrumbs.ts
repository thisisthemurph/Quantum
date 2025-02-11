import { useEffect } from "react";
import { useBreadcrumbsStore, Breadcrumbs } from "@/stores/BreadcrumbsStore.tsx";

export const useBreadcrumbs = (initialBreadcrumbs?: Breadcrumbs) => {
  const breadcrumbs = useBreadcrumbsStore((state) => state.breadcrumbs);
  const setBreadcrumbs = useBreadcrumbsStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    if (!breadcrumbs && initialBreadcrumbs) {
      setBreadcrumbs(initialBreadcrumbs);
    }
  }, [breadcrumbs, initialBreadcrumbs, setBreadcrumbs]);

  return {breadcrumbs, setBreadcrumbs} as const;
};
