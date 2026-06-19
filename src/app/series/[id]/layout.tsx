import { SERIES } from "@/lib/content/catalog";

export function generateStaticParams() {
  return SERIES.map((series) => ({ id: series.id }));
}

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
