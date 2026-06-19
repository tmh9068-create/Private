import { lectureVideos as baseLectureVideos } from "./lectures";

export function getLectureVideos() {
  const envIds = process.env.MUX_PLAYBACK_IDS?.split(",").map((id) => id.trim()).filter(Boolean);

  return baseLectureVideos.map((lecture, index) => ({
    ...lecture,
    playbackId: envIds?.[index] || lecture.playbackId,
  }));
}
