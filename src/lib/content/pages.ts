import pagesData from "./pages.json";

export type PortalPage = {
  slug: string;
  title: string;
  description: string;
  body: string;
};

export const portalPages = pagesData as PortalPage[];

export const portalPageMap = Object.fromEntries(
  portalPages.map((page) => [page.slug, page])
) as Record<string, PortalPage>;

export const progressTrackableSlugs = [
  ...portalPages.map((p) => p.slug),
  "todo-1",
  "todo-2",
  "todo-3",
  "todo-4",
  "todo-5",
  "todo-6",
  "todo-7",
].filter((slug, index, arr) => arr.indexOf(slug) === index);
