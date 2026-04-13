type MessageType =
  | "audio"
  | "video"
  | "image"
  | "text"
  | "file"
  | "text-image"
  | "text-video"
  | "text-audio"
  | "text-file"
  | "text-image-file"
  | "image-file"
  | "voice_note";

export function getMessageType(
  content: string | null,
  fileNames: string[] | null,
): MessageType {
  const hasText = !!content?.trim();
  const hasFiles = fileNames && fileNames.length > 0;

  if (!hasFiles) return "text";

  let hasImage = false;
  let hasVideo = false;
  let hasAudio = false;
  let hasOtherFile = false;

  for (const name of fileNames!) {
    const ext = name.split(".").pop()?.toLowerCase();

    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext!)) {
      hasImage = true;
    } else if (["mp4", "mov", "webm", "mkv"].includes(ext!)) {
      hasVideo = true;
    } else if (["mp3", "wav", "ogg", "aac"].includes(ext!)) {
      hasAudio = true;
    } else {
      hasOtherFile = true;
    }
  }

  // TEXT + FILES
  if (hasText) {
    if (hasImage && hasOtherFile) return "text-image-file";
    if (hasImage) return "text-image";
    if (hasVideo) return "text-video";
    if (hasAudio) return "text-audio";
    if (hasOtherFile) return "text-file";
  }

  // FILES ONLY
  if (hasImage && hasOtherFile) return "image-file";
  if (hasImage) return "image";
  if (hasVideo) return "video";
  if (hasAudio) return "audio";
  if (hasOtherFile) return "file";

  return "text";
}
