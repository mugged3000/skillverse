// Uploads a file straight from the browser to Cloudinary using an
// UNSIGNED upload preset — the file never passes through our own
// server, so there's no server body-size limit to worry about (this
// matters for video: Next.js API routes on serverless hosts often cap
// request bodies around 4-5MB, which most videos blow past).
//
// One-time setup (free Cloudinary account, a few minutes):
//   1. Sign up at https://cloudinary.com — free tier is plenty for a
//      project like this (25GB storage / 25GB bandwidth a month).
//   2. Your "Cloud name" is shown right on the dashboard homepage.
//   3. Settings (gear icon) → Upload → Upload presets → Add upload
//      preset. Set "Signing Mode" to "Unsigned". Give it a name.
//      Recommended while you're at it: set a "Folder" (e.g.
//      "skillverse") and a "Max file size" on the preset itself —
//      since the preset name is public (it ships in client-side JS),
//      those limits are what stop random visitors from using your
//      account as free file storage.
//   4. Put both values in .env:
//        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
//        NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset-name"
//   5. Restart `npm run dev`.
//
// These two values are NEXT_PUBLIC_ on purpose — an unsigned preset is
// specifically designed to be called from client-side code. It can
// only add new uploads within whatever limits the preset itself sets;
// it can't read, list, or delete anything in your account.

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

// Uses Cloudinary's /auto/upload endpoint so it doesn't need to be
// told in advance whether the file is an image or a video — the
// response's resource_type tells us which one it turned out to be.
// onProgress receives 0-100 as the upload streams.
export function uploadFileToCloudinary(file, { onProgress } = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(
      new Error(
        "Uploads aren't set up yet — add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env (see src/lib/cloudinaryUpload.js)."
      )
    );
  }

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const isVideo = data.resource_type === "video";
          resolve({
            // For video specifically, rewrite the URL to force a
            // broadly-compatible format (H.264/mp4) via Cloudinary's
            // f_auto,q_auto transformation. Without this, a video
            // recorded on an iPhone often uploads as .mov (HEVC),
            // which plays fine in Safari but not in Chrome on Android
            // or many other browsers — it would just silently fail to
            // play there. f_auto picks the best compatible format for
            // whichever browser ends up requesting it.
            url: isVideo
              ? data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/")
              : data.secure_url,
            mediaType: isVideo ? "video" : "image",
          });
        } catch {
          reject(new Error("Cloudinary returned an unexpected response."));
        }
      } else {
        let message = `Upload failed (${xhr.status}).`;
        try {
          const data = JSON.parse(xhr.responseText);
          if (data?.error?.message) message = data.error.message;
        } catch {
          // ignore — keep the generic message
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}
