"use client";

import { useMemo } from "react";
import { MuxVideoPlayer } from "@/components/MuxVideoPlayer";
import { PageProgressToggle } from "@/components/PageProgressToggle";

type ContentBodyProps = {
  html: string;
  pageSlug: string;
  completed?: boolean;
};

type Segment =
  | { type: "html"; value: string }
  | { type: "mux"; playbackId: string };

function parseContent(html: string): Segment[] {
  const pattern = /<div data-mux-playback-id="([^"]+)"><\/div>/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "html", value: html.slice(lastIndex, match.index) });
    }
    segments.push({ type: "mux", playbackId: match[1] });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < html.length) {
    segments.push({ type: "html", value: html.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "html", value: html }];
}

export function ContentBody({ html, pageSlug, completed = false }: ContentBodyProps) {
  const segments = useMemo(() => parseContent(html), [html]);

  return (
    <div className="article">
      {segments.map((segment, index) =>
        segment.type === "mux" ? (
          <MuxVideoPlayer key={`mux-${index}`} playbackId={segment.playbackId} />
        ) : (
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: segment.value }}
          />
        )
      )}
      <PageProgressToggle pageSlug={pageSlug} initialCompleted={completed} />
    </div>
  );
}
