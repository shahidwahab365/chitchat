import { ENV } from "@/constants/env-exports";
import { FILE_SEPARATOR } from "@/constants/special-chars";
import * as tus from "tus-js-client";

export async function uploadFile({
  file,
  session,
  setPercentage,
}: {
  file: File;
  session: any;
  setPercentage: any;
}) {
  return new Promise(async (resolve, reject) => {
    const token = await session.getToken({ template: "supabase" });

    if (!token) {
      reject("Unauthorized Request");
      throw new Error("Unauthorized Request");
    }

    const fileName = `${Date.now()}${FILE_SEPARATOR}${file.name}`;
    const upload = new tus.Upload(file, {
      endpoint: `https://${ENV.SUPABASE.PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        "x-upsert": "false",
        "Access-Control-Allow-Origin": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: ENV.SUPABASE.STORAGE_BUCKET_NAME,
        objectName: `${session.user.id}/${fileName}`,
        contentType: file.type,
        cacheControl: "3600",
        metadata: JSON.stringify({
          yourCustomMetadata: false,
        }),
      },
      chunkSize: 6 * 1024 * 1024,
      onError: function (error) {
        reject(error);
        throw new Error(
          error.message || `Something went wrong while sending ${file.name}`,
        );
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        const cleanName = fileName.split(FILE_SEPARATOR)[1];

        setPercentage(cleanName, Number(percentage));
      },
      onSuccess: function () {
        setPercentage(null)
        resolve(fileName);
      },
    });

    return upload.findPreviousUploads().then(function (previousUploads) {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      upload.start();
    });
  });
}

export async function uploadVoiceNote({
  file,
  session,
}: {
  file: File;
  session: any;
}) {
  return new Promise(async (resolve, reject) => {
    const token = await session.getToken({ template: "supabase" });

    if (!token) {
      reject("Unauthorized Request");
      throw new Error("Unauthorized Request");
    }

    const upload = new tus.Upload(file, {
      endpoint: `https://${ENV.SUPABASE.PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        "x-upsert": "false",
        "Access-Control-Allow-Origin": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: ENV.SUPABASE.STORAGE_VOICE_NOTE_BUCKET_NAME,
        objectName: `${session.user.id}/${file.name}`,
        contentType: file.type,
        cacheControl: "3600",
        metadata: JSON.stringify({
          yourCustomMetadata: false,
        }),
      },
      chunkSize: 6 * 1024 * 1024,
      onError: function (error) {
        reject(error);
        throw new Error(
          error.message || `Something went wrong while sending ${file.name}`,
        );
      },
      onSuccess: function () {
        resolve(true);
      },
    });

    return upload.findPreviousUploads().then(function (previousUploads) {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      upload.start();
    });
  });
}
