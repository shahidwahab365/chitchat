import { IMessages } from "@/types/messages";
import { DoubleTick, formatTime } from "./chats-main";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Play, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDeleteMessage } from "@/hooks/react-query/mutation-message";
import { Loader } from "./loader";
import { getEmojiCount, getEmojiSize, isOnlyEmoji } from "@/lib/emoji";
import { IMAGES } from "@/constants/images";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  useDownloadAttachement,
  usePreviewAttachement,
} from "@/hooks/react-query/query-messages";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FILE_SEPARATOR } from "@/constants/special-chars";
import { CircularProgress } from "./cercular-progress";
import FilePreview from "reactjs-file-preview";
import Image from "next/image";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import VoiceNoteBubbleSkeleton from "./skeletons/voice-note-bubble-skeleton";
import UserAvatar from "./avatar";

const FileAttachementType = [
  "image",
  "video",
  "file",
  "text-image",
  "text-video",
  "text-file",
  "text-image-file",
  "text-audio",
  "image-file",
];

const isLocalFile = (file: File | string): file is File => file instanceof File;

const getFileIcon = (fileName: string) => {
  if (!fileName) return IMAGES.ICONS.FILE;

  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "doc":
    case "docx":
      return IMAGES.ICONS.WORD;
    case "xls":
    case "xlsx":
    case "csv":
      return IMAGES.ICONS.EXCEL;
    case "ppt":
    case "pptx":
      return IMAGES.ICONS.PPT;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return IMAGES.ICONS.ZIP;
    case "txt":
    case "md":
    case "pdf":
      return IMAGES.ICONS.FILE;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
    case "ico":
    case "tiff":
    case "avif":
      return IMAGES.ICONS.IMAGE;
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
    case "flv":
      return IMAGES.ICONS.VIDEO;
    case "mp3":
    case "wav":
    case "ogg":
    case "aac":
    case "flac":
    case "m4a":
      return IMAGES.ICONS.AUDIO;
    default:
      return IMAGES.ICONS.FILE;
  }
};

function useBlobUrls() {
  const mapRef = useRef<Map<File, string>>(new Map());

  const getUrl = (file: File | string) => {
    if (!(file instanceof File)) return file;

    if (!mapRef.current.has(file)) {
      mapRef.current.set(file, URL.createObjectURL(file));
    }

    return mapRef.current.get(file)!;
  };

  useEffect(() => {
    return () => {
      for (const url of mapRef.current.values()) {
        URL.revokeObjectURL(url);
      }
      mapRef.current.clear();
    };
  }, []);

  return getUrl;
}

function NoPreview({
  fileName,
  isOpen,
}: {
  fileName: string;
  isOpen: boolean;
}) {
  const iconSrc = getFileIcon(fileName);

  if (!isOpen) {
    return (
      <Image
        src={iconSrc}
        alt={fileName}
        width={100}
        height={100}
        className="flex items-center justify-center  w-full h-full p-4"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <Image src={iconSrc} alt={fileName} width={130} height={130} />

      <p className="text-center text-base sm:text-lg md:text-xl font-semibold text-accent-foreground">
        No preview available
      </p>
    </div>
  );
}

function PreviewAttachement({
  url,
  percentage,
  totalLength,
  isOpen,
  isWaiting,
  fileName,
}: {
  url: string;
  alt: string;
  totalLength: number;
  percentage: number;
  isOpen: boolean;
  isWaiting: boolean;
  fileName: string;
}) {
  const previewExt = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "bmp",
    "svg",
    "ico",
    "tiff",
    "tif",
    "avif",
    "heic",
    "heif",
    "mp3",
    "wav",
    "ogg",
    "aac",
    "flac",
    "m4a",
    "wma",
    "opus",
    "amr",
    "aiff",
    "pdf",
  ];
  const extension = fileName?.split(".")[1];

  return (
    <div className="relative w-full h-full">
      {previewExt.includes(extension) ? (
        <div className="w-full h-full">
          <FilePreview
            preview={url}
            placeHolderImage={url}
            errorImage="No preview available yet."
          />
        </div>
      ) : (
        <NoPreview isOpen={isOpen} fileName={fileName} />
      )}

      {isOpen && percentage > 0 && (
        <CircularProgress isWaiting={isWaiting} value={percentage} />
      )}
      {!isOpen && percentage > 0 && totalLength < 3 && (
        <CircularProgress value={percentage} isWaiting={isWaiting} />
      )}
    </div>
  );
}

function MessageAttachment({
  m,
  data,
  incoming,
  percentage,
}: {
  m: IMessages;
  data: any[];
  error: any;
  incoming: boolean;
  percentage: { fileName: string; percentage: number }[];
}) {
  const [downFName, setDownFName] = useState<string | null>(null);
  const { mutate: downloadFn, isPending } = useDownloadAttachement({
    setDownFName,
    downFName,
  });
  const [open, setOpen] = useState<boolean>(false);

  const files = m.file_name || [];

  const visibleFiles = files.slice(0, 4);
  const remaining = files.length - 4;

  const getGridClass = () => {
    if (visibleFiles.length === 1) return "grid-cols-1";
    if (visibleFiles.length === 2) return "grid-cols-2";
    return "grid-cols-2";
  };

  const getItemHeight = (index: number) => {
    if (visibleFiles.length === 1) return "h-30";
    if (visibleFiles.length === 2) return "h-25";
    if (visibleFiles.length === 3 && index === 0) return "col-span-2 h-40";
    return "h-36";
  };

  async function handleAttachementDownload({
    path,
    f_name,
  }: {
    path: string;
    f_name: string;
  }) {
    setDownFName(f_name);
    downloadFn({ path });
  }

  const getBlobUrl = useBlobUrls();

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <div
          className={`grid gap-0.5 overflow-hidden h-fit cursor-pointer w-full ${getGridClass()}`}
        >
          {visibleFiles.map((file: File | string, index: number) => {
            const isLastVisible = index === visibleFiles.length - 1;
            const showOverlay = isLastVisible && remaining > 0;
            const fileName = isLocalFile(file) ? file.name : file;

            const url = isLocalFile(file)
              ? getBlobUrl(file)
              : data.length
                ? data[index].signedUrl
                : getFileIcon(fileName);

            const percent =
              percentage?.find((p) => p.fileName === fileName)?.percentage || 0;

            const isWaiting =
              isLocalFile(file) &&
              percentage &&
              percentage.length > 0 &&
              !percentage.find((p) => p.fileName === fileName);

            return (
              <div
                key={index}
                className={`relative overflow-hidden group rounded-md aspect-square  ${data.length && incoming && "bg-primary-foreground "} ${data.length && !incoming && "bg-[#331e0b]"} ${getItemHeight(index)}`}
              >
                <PreviewAttachement
                  isWaiting={isWaiting}
                  alt={m.message_type}
                  url={url}
                  totalLength={visibleFiles.length}
                  percentage={isWaiting ? 1 : percent}
                  isOpen={open}
                  fileName={fileName}
                />

                {!showOverlay && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                )}

                {showOverlay && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold tracking-tight">
                      +{remaining}
                    </span>
                  </div>
                )}

                {percentage && percentage.length && visibleFiles.length > 2 && (
                  <div className="absolute top-50 right-50 p-2 bg-primary-foreground rounded-full">
                    <Loader className="size-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogTrigger>

      <DialogContent className="aspect-square p-2 border-none h-[80%] overflow-auto flex flex-col">
        <DialogTitle>Attachments</DialogTitle>
        {m?.file_name?.map((f_name: any, index: number) => {
          const fileName = isLocalFile(f_name) ? f_name.name : f_name;

          const showFName = isLocalFile(f_name)
            ? f_name.name
            : f_name.split(FILE_SEPARATOR)[1];

          const url = isLocalFile(f_name)
            ? getBlobUrl(f_name)
            : data.length
              ? data[index].signedUrl
              : getFileIcon(fileName);

          const percent =
            percentage?.find((p) => p.fileName === fileName)?.percentage || 0;

          const isWaiting =
            isLocalFile(f_name) &&
            percentage &&
            percentage.length > 0 &&
            !percentage.find((p) => p.fileName === fileName);

          return (
            <div
              key={index}
              className="relative w-full h-full bg-primary-foreground hover:bg-primary-foreground/80 rounded-md cursor-pointer"
            >
              <PreviewAttachement
                isWaiting={isWaiting}
                alt={m.message_type}
                url={url}
                totalLength={visibleFiles.length}
                percentage={isWaiting ? 1 : percent}
                isOpen={open}
                fileName={fileName}
              />
              <Button
                type="button"
                variant={"outline"}
                className="w-fit h-fit p-1 cursor-pointer absolute top-2 right-2"
                onClick={() =>
                  handleAttachementDownload({
                    path: `${m.sender_id}/${f_name}`,
                    f_name,
                  })
                }
                disabled={isPending}
              >
                {isPending && f_name == downFName ? (
                  <Loader className="size-4" />
                ) : (
                  <Download strokeWidth={1.89} className="size-4" />
                )}
              </Button>

              <span className="absolute bottom-0 right-0 rounded-ss-md text-xs p-1 bg-accent/50">
                {showFName}
              </span>
            </div>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
function VoiceNote({
  m,
  data,
  incoming,
  error,
}: {
  m: IMessages;
  incoming: boolean;
  error: Error | null;
  data: any;
}) {
  const controls = useVoiceVisualizer();
  const { setPreloadedAudioBlob, togglePauseResume, formattedDuration,  } =
    controls;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = m?.file_name?.[0];
    if (!audio || !data) return;

    async function loadAudio() {
      setIsLoading(true);
      try {
        if (audio instanceof File) {
          setPreloadedAudioBlob(audio);
        } else {
          const res = await fetch(data[0].signedUrl);
          const blob = await res.blob();
          setPreloadedAudioBlob(blob);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAudio();
  }, [m?.file_name, data]);

  if (error) {
    return <div className="flex text-sm text-destructive">{error.message}</div>;
  }

  return (
    <div
      className={`flex items-start justify-center gap-2 ${incoming && "flex-row-reverse"}`}
    >
      {isLoading ? (
        <VoiceNoteBubbleSkeleton incomming={isLoading} />
      ) : (
        <>
          <Button
            variant={"outline"}
            onClick={togglePauseResume}
            className="border-none rounded-full cursor-pointer w-10 h-10 flex items-center justify-center"
          >
            <Play fill="white" strokeWidth={1.89} className="size-4" />
          </Button>

          <div className="flex flex-col items-start pt-2 gap-2">
            <style>
              {`.custom-waveform {
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background-color: white;
                  top: 50%;
                  transform: translate(-50%, -50%);
              }`}
            </style>
            <VoiceVisualizer
              controls={controls}
              height={20}
              width={180}
              isControlPanelShown={false}
              isProgressIndicatorTimeShown={false}
              progressIndicatorClassName="custom-waveform"
              secondaryBarColor="#f0b000"
            />
            <span className="text-[11px] tabular-nums opacity-70">
              {formattedDuration}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default VoiceNote;

export function OptionsMenu({
  showOptions,
  m,
  isOnlyEmoji,
}: {
  showOptions: boolean;
  m: IMessages;
  isOnlyEmoji: boolean;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const { mutate: deleteMessageFn, isPending } = useDeleteMessage({
    setOpen,
    recipient_id: m.recipient_id,
  });
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={[
          "rounded-full absolute right-1 top-2 z-20 bg-primary/50 cursor-pointer",
          isOnlyEmoji && "top-1",
          showOptions ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <ChevronDown className="size-4.5" strokeWidth={1.89} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuLabel>Message options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex gap-2 cursor-pointer"
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
              deleteMessageFn({ message_id: m.id });
            }}
            disabled={isPending}
          >
            <Trash className="size-4" strokeWidth={1.89} />
            <span>{isPending ? "Deleting..." : "Delete"}</span>
            {isPending && <Loader />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MessageBubble({
  m,
  incoming,
  showTail,
  percentage,
}: {
  m: IMessages;
  incoming: boolean;
  showTail?: boolean;
  percentage: { fileName: string; percentage: number }[];
}) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const onlyEmoji = isOnlyEmoji(m.content ?? "");
  const emojiSize = onlyEmoji ? getEmojiSize(m.content ?? "") : "text-sm";
  const emojiCount = onlyEmoji ? getEmojiCount(m.content ?? "") : 0;

  const hasLocalFiles =
    m.file_name?.some((file) => file instanceof File) ?? false;

  const {
    data: AttachementsData,
    error,
    isLoading,
  } = usePreviewAttachement({
    path: !hasLocalFiles
      ? (m.file_name?.map((name: string | File) => `${m.sender_id}/${name}`) ??
        [])
      : [],
    type: m.message_type,
    isEnabled: !hasLocalFiles && (m.file_name?.length ?? 0) > 0,
  });

  if (error) toast.error(error.message);

  return (
    <div
      className={[
        "flex items-end gap-2 relative",
        incoming ? "justify-start" : "justify-end",
      ].join(" ")}
    >
      <div
        className={[
          "flex max-w-[85%] sm:max-w-[72%] md:max-w-[62%] px-2 gap-2 relative",

          emojiCount < 2 && onlyEmoji
            ? "flex-col items-center"
            : incoming
              ? `rounded-e-md rounded-es-md ${
                  showTail ? "rounded-ee-md" : "rounded-md"
                }
              bg-primary-foreground/10 dark:bg-primary-foreground/40 
              text-foreground`
              : `rounded-s-md rounded-ee-md ${
                  showTail ? "rounded-es-md" : "rounded-e-md"
                } 
              bg-primary-foreground dark:bg-primary-foreground 
              dark:text-foreground text-white`,
          m.message_type !== "text" && "flex-col py-1",
        ].join(" ")}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {showTail && !onlyEmoji && (
          <div
            className={[
              "absolute w-4 h-4 top-0",
              incoming
                ? "left-0 -translate-x-full bottom-2 bg-primary-foreground/10 dark:bg-primary-foreground/40 [clip-path:polygon(100%_0,50%_0,100%_50%)]"
                : "right-0 translate-x-full bottom-2 bg-primary-foreground dark:bg-primary-foreground [clip-path:polygon(0_0,50%_0,0_50%)]",
            ].join(" ")}
          />
        )}

        {FileAttachementType.includes(m.message_type) && (
          <div className="flex h-fit">
            <MessageAttachment
              m={m}
              data={AttachementsData ?? []}
              error={error}
              incoming={incoming}
              percentage={percentage}
            />
          </div>
        )}

        {m.message_type === "voice_note" &&
          (!isLoading ? (
            <div className="flex h-fit">
              <VoiceNote
                m={m}
                data={AttachementsData ?? []}
                error={error}
                incoming={incoming}
              />
            </div>
          ) : (
            <VoiceNoteBubbleSkeleton incomming={isLoading} />
          ))}

        {m.message_type !== "voice_note" && (
          <div className="flex items-start pb-2">
            {m.content && (
              <p
                className={[
                  "whitespace-pre-wrap wrap-break-word",
                  onlyEmoji && "tracking-[-4px]",
                  emojiSize,
                ].join(" ")}
              >
                {m.content}
              </p>
            )}
          </div>
        )}

        <div
          className={[
            "flex items-end pb-px",
            m.message_type !== "text" && "justify-end",
          ].join(" ")}
        >
          <div
            className={`flex items-center justify-center gap-1 h-4 ${onlyEmoji && emojiCount < 2 && "bg-primary-foreground rounded-md px-2 py-3 "}`}
          >
            {m.is_edited && (
              <span className="text-[11px] opacity-70">edited</span>
            )}

            {m.created_at && (
              <span className="text-[11px] tabular-nums opacity-70">
                {formatTime(m.created_at)}
              </span>
            )}

            {!incoming && (
              <OptionsMenu
                isOnlyEmoji={onlyEmoji}
                m={m}
                showOptions={showOptions}
              />
            )}

            {!incoming && (
              <span className="translate-y-px">
                <DoubleTick status={m.message_read_status} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
