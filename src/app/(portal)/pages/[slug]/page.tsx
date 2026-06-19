import { notFound } from "next/navigation";
import { portalPageMap } from "@/lib/content/pages";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return Object.keys(portalPageMap).map((slug) => ({ slug }));
}

export default function ContentPage({ params }: PageProps) {
  const page = portalPageMap[params.slug];
  if (!page) notFound();

  return (
    <article className="prose-portal">
      <header className="mb-6">
        <h1>{page.title}</h1>
        <p className="!text-txt-sub">{page.description}</p>
      </header>
      <div dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}
