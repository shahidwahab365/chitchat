import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import FilePreview from "reactjs-file-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { IMAGES } from "@/constants/images";
import { useRef } from "react";
import { Input } from "./ui/input";

const getFilePreviewForTrigger = (file: File | null, previewURL: string) => {
  const type = file?.type || "";

  if (type.startsWith("image/")) {
    return previewURL;
  }

  if (type.startsWith("video/")) {
    return IMAGES.ICONS.VIDEO;
  }

  if (type.startsWith("audio/")) {
    return IMAGES.ICONS.AUDIO;
  }

  if (type === "application/pdf") {
    return IMAGES.ICONS.PDF;
  }

  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return IMAGES.ICONS.WORD;
  }

  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return IMAGES.ICONS.EXCEL;
  }

  if (
    type === "application/vnd.ms-powerpoint" ||
    type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return IMAGES.ICONS.PPT;
  }

  if (type === "text/plain") {
    return IMAGES.ICONS.FILE;
  }

  if (type === "application/zip" || type === "application/x-rar-compressed") {
    return IMAGES.ICONS.ZIP;
  }

  return IMAGES.ICONS.FILE;
};

const getFileIcon = (file: File | null) => {
  if (!file) return IMAGES.ICONS.FILE;

  const extension = file.name.split(".").pop()?.toLowerCase();

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

const getFilePreview = (file: File | null, previewURL: string) => {
  const type = file?.type || "";

  if (type === "image/") return previewURL;
  if (type === "video/") return previewURL;
  if (type === "audio/") return previewURL;
  if (type === "application/pdf") return previewURL;

  return getFilePreviewForTrigger(file, previewURL);
};

const getFileMeta = (file: File | null) => {
  if (!file) return null;

  const type = file.type || "";

  if (
    type.startsWith("image/") ||
    type.startsWith("video/") ||
    type.startsWith("audio/") ||
    type === "application/pdf"
  ) {
    return null;
  }

  const extension = file.name?.split(".").pop()?.toUpperCase();

  return extension;
};

function NoPreview({ file }: { file: File | null }) {
  const iconSrc = getFileIcon(file);
  const extension = getFileMeta(file);

  return (
    <div
      className="flex flex-col items-center justify-center 
                    bg-accent 
                    w-full max-w-lg
                    mx-auto 
                    rounded-xl 
                    p-8 sm:p-15 md:p-30 
                    h-full"
    >
      <Image
        src={iconSrc}
        alt="File icon"
        width={120}
        height={120}
        className="mb-4 
                   w-15 h-15
                   sm:w-24 sm:h-24 
                   md:w-38 md:h-38 
                   object-contain"
      />

      <p
        className="text-center 
                    text-base sm:text-lg md:text-xl 
                    font-semibold 
                    text-accent-foreground"
      >
        No preview available
      </p>

      <p
        className="text-xs sm:text-sm md:text-base 
                    mt-2 
                    text-muted-foreground 
                    font-medium 
                    text-center wrap-break-word"
      >
        {file?.size ? `${(file.size / 1024).toFixed(1)} KB` : "Unknown size"}
        {extension && ` • ${extension}`}
      </p>
    </div>
  );
}

function SendFileAttachementDialog({
  setOpen,
  selectedFiles,
  setSelectedFiles,
}: {
  setOpen: (open: boolean) => void;
  selectedFiles: File[] | null;
  setSelectedFiles: (e: File[] | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!selectedFiles || selectedFiles.length === 0) {
    toast.error("No file selected or file is empty.");
    setOpen(false);
    return null;
  }

  const getPreviewClass = (file: File) => {
    const base = "w-full mx-auto h-[50vh]";

    if (file.type.startsWith("image")) return `${base} max-w-2xl`;

    if (file.type.startsWith("video")) return `${base} max-w-4xl`;

    if (file.type === "application/pdf") return `${base} max-w-4xl`;

    if (file.type.startsWith("audio"))
      return `${base} max-w-xl flex items-center justify-center`;

    return `${base} max-w-3xl`;
  };

  function handleRemoveFile(file: File | null) {
    if (!file) return;

    if (selectedFiles?.length === 1) {
      setSelectedFiles(null);
      setOpen(false);
    }

    const updated = selectedFiles?.filter((n: File) => n.name !== file.name);
    setSelectedFiles(updated || null);
  }

  return (
    <div className="w-full h-full relative z-10 px-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"secondary"}
            className="absolute cursor-pointer w-9 h-9 top-2 right-2 rounded-full bg-transparent z-10"
          >
            <X className="size-5" strokeWidth={1.89} />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="bg-destructive/10 p-3 rounded-full mb-3">
              <AlertTriangle className="size-6 text-primary" />
            </div>

            <DialogTitle>Close this tab?</DialogTitle>

            <DialogDescription>
              If you close this tab, any unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-center">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                variant={"default"}
                onClick={() => {
                  setSelectedFiles(null);
                  setOpen(false);
                }}
              >
                Discard
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        defaultValue={selectedFiles?.[(selectedFiles?.length || 1)-1]?.name || undefined}
        className="w-full h-full"
      >
        {selectedFiles?.map((file: File) => {
          const previewURL = URL.createObjectURL(file);
          return (
            <TabsContent
              key={file.name}
              value={file.name}
              className="w-full h-full"
            >
              <div className="flex flex-col w-full h-full justify-center items-center ">
                <div className="h-full w-fit flex items-center justify-center">
                  <div className={[getPreviewClass(file)].join(" ")}>
                    {file.type.startsWith("image/") ||
                    // file.type.startsWith("video/") ||
                    file.type.startsWith("audio/") ||
                    file.type === "application/pdf" ? (
                      <FilePreview preview={getFilePreview(file, previewURL)} />
                    ) : (
                      <NoPreview file={file} />
                    )}
                    <p className="absolute text-center top-4 left-0 text-md font-normal w-full">
                      {file.name}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
        <TabsList className="w-full min-h-fit bg-transparent border-t border-border p-2 gap-2">
          {selectedFiles.map((file: File) => {
            const previewURL = URL.createObjectURL(file);

            return (
              <TabsTrigger
                key={file.name}
                value={file.name}
                className="relative max-w-13 min-h-13 rounded-md group"
              >
                <Image
                  src={getFilePreviewForTrigger(file, previewURL)}
                  alt="file-preview"
                  fill
                  className="object-cover p-1 rounded-md"
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file);
                  }}
                  className="absolute 
               -top-1.5 -right-1.5 
               w-6 h-6 
               flex items-center justify-center
               rounded-full 
               bg-black/80 
               text-destructive-foreground 
               hover:bg-destructive 
               opacity-0 
               group-hover:opacity-100 
               transition-all 
               duration-200 
               cursor-pointer 
               z-40"
                >
                  <X className="size-3" strokeWidth={1.89} />
                </div>
              </TabsTrigger>
            );
          })}
          <div className="w-fit h-fit">
            <Button
              type="button"
              variant={"outline"}
              className="w-13 h-13 rounded-md text-2xl cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              +
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const files = e.target.files;

                if (!files || files.length === 0) {
                  toast.error("No file selected or file is empty.");
                  return;
                }

                const newFiles = Array.from(files);
                const duplicates = newFiles.some((file) =>
                  selectedFiles.some((selected) => selected.name === file.name),
                );

                if (duplicates) {
                  toast.error("This file is already imported.");
                  return;
                }

                setSelectedFiles([...selectedFiles, ...newFiles]);
                e.target.value = "";
              }}
              className="hidden"
              accept="image/*, application/*"
            />
          </div>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default SendFileAttachementDialog;
