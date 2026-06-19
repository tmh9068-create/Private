import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { portalPageMap } from "@/lib/content/pages";
import { getUserProgressMap } from "@/lib/progress";
import { ContentBody } from "@/components/ContentBody";
import { ArchiveLectureContent } from "@/components/ArchiveLectureContent";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return Object.keys(portalPageMap).map((slug) => ({ slug }));
}

export default async function ContentPage({ params }: PageProps) {
  const page = portalPageMap[params.slug];
  if (!page) notFound();

  const session = await auth();
  const progress = session?.user?.id
    ? await getUserProgressMap(session.user.id)
    : {};
  const completed = Boolean(progress[params.slug]);

  return (
    <article>
      <header className="mb-6">
        <h1 className="text-ui-xl font-bold text-txt">{page.title}</h1>
        <p className="mt-1 text-ui-base text-txt-sub">{page.description}</p>
      </header>

      {params.slug === "archive-lecture" ? (
        <ArchiveLectureContent completed={completed} />
      ) : (
        <ContentBody html={page.body} pageSlug={params.slug} completed={completed} />
      )}
    </article>
  );
}
