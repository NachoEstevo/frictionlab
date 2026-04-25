import { put } from "@vercel/blob";

type UploadScreenshotToBlobInput = {
  pathname: string;
  image: ArrayBuffer;
  contentType: string;
  blobReadWriteToken?: string;
};

export async function uploadScreenshotToBlob(input: UploadScreenshotToBlobInput) {
  if (!input.blobReadWriteToken) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to upload screenshots to Vercel Blob.");
  }

  const blob = await put(input.pathname, new Blob([input.image], { type: input.contentType }), {
    access: "public",
    contentType: input.contentType,
    allowOverwrite: true,
    token: input.blobReadWriteToken
  });

  return {
    url: blob.url,
    pathname: blob.pathname
  };
}
