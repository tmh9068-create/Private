"use client";

import MuxPlayer from "@mux/mux-player-react";

type MuxVideoPlayerProps = {
  playbackId: string;
  title?: string;
};

export function MuxVideoPlayer({ playbackId, title = "動画" }: MuxVideoPlayerProps) {
  return (
    <figure className="mux-video my-6 overflow-hidden rounded-section border border-bd bg-black">
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        title={title}
        className="aspect-video w-full"
        accentColor="#0d6ca7"
      />
    </figure>
  );
}
