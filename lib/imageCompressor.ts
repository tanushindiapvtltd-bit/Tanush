/**
 * Client-side image compressor using HTML5 Canvas.
 * Resizes the image to fit within max width/height while maintaining the aspect ratio,
 * and compresses it using JPEG or WebP quality encoding.
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeBytes?: number;
  } = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeBytes = 1.5 * 1024 * 1024, // 1.5 MB
  } = options;

  // Only compress images
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // If the image is already small (e.g., under 1MB), we can skip compression to save processing time
  if (file.size < maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions preserving aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            // Fallback to original file if canvas context is unavailable
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Use original mime type if supported, fallback to image/jpeg
          let mimeType = file.type;
          if (!["image/jpeg", "image/webp", "image/png"].includes(mimeType)) {
            mimeType = "image/jpeg";
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // Fallback to original file
                return;
              }

              // Only use the compressed file if it's actually smaller than the original
              if (blob.size < file.size) {
                const compressedFile = new File([blob], file.name, {
                  type: mimeType,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            mimeType,
            quality
          );
        } catch {
          resolve(file); // Fallback on error
        }
      };

      img.onerror = () => {
        resolve(file); // Fallback on error
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file); // Fallback on error
    };

    reader.readAsDataURL(file);
  });
}
