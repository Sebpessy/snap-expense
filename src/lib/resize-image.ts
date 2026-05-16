"use client";

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.7;

export async function resizeImageForUpload(file: Blob): Promise<Blob> {
  if (typeof window === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement("canvas"), {
            width,
            height,
          });
    const ctx = (canvas as OffscreenCanvas | HTMLCanvasElement).getContext(
      "2d",
    );
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    if (canvas instanceof OffscreenCanvas) {
      return await canvas.convertToBlob({
        type: "image/jpeg",
        quality: JPEG_QUALITY,
      });
    }
    return await new Promise<Blob>((resolve) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => resolve(b ?? file),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });
  } catch {
    return file;
  }
}
