import { create } from "zustand";

type BreadcrumbLink = {
  href: string;
  text: string;
}

export type Breadcrumbs = {
  crumbs?: BreadcrumbLink[];
  current: string;
}

interface BreadcrumbsStoreState {
  breadcrumbs: Breadcrumbs | null;
  setBreadcrumbs: (breadcrumbs: Breadcrumbs | null) => void;
}

export const useBreadcrumbsStore = create<BreadcrumbsStoreState>((set) => ({
  breadcrumbs: null,
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
