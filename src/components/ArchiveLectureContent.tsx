import { lectureVideos } from "@/lib/content/lectures";
import { MuxVideoPlayer } from "@/components/MuxVideoPlayer";
import { PageProgressToggle } from "@/components/PageProgressToggle";

type ArchiveLectureContentProps = {
  completed?: boolean;
};

export function ArchiveLectureContent({ completed = false }: ArchiveLectureContentProps) {
  return (
    <div className="article">
      <p>各回の講義動画と関連資料をまとめています。下のリストから視聴したい回を選んでください。</p>

      <div className="callout warning my-6 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-ui-sm text-amber-800">
        <strong>受講生限定コンテンツです</strong>
        <p className="mt-1">第三者への共有・再配布・録画はお控えください。</p>
      </div>

      <div className="space-y-8">
        {lectureVideos.map((lecture) => (
          <section
            key={lecture.id}
            id={`lecture-${lecture.id}`}
            className="rounded-section border border-bd bg-surface p-5 shadow-hover"
          >
            <div className="mb-4">
              <p className="text-ui-xs font-bold uppercase tracking-wider text-primary">
                第{lecture.id}回
              </p>
              <h2 className="text-ui-lg font-bold text-txt">{lecture.title}</h2>
              <p className="text-ui-sm text-txt-dim">{lecture.date}</p>
              {lecture.description && (
                <p className="mt-2 text-ui-sm text-txt-sub">{lecture.description}</p>
              )}
            </div>
            {lecture.playbackId ? (
              <MuxVideoPlayer playbackId={lecture.playbackId} title={lecture.title} />
            ) : (
              <p className="rounded-card bg-page px-4 py-3 text-ui-sm text-txt-dim">
                動画は準備中です。
              </p>
            )}
          </section>
        ))}
      </div>

      <PageProgressToggle pageSlug="archive-lecture" initialCompleted={completed} />
    </div>
  );
}
