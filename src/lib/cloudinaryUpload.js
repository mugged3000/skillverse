// Uploads a file from the browser straight to Cloudinary using a SIGNED
// upload. The file never passes through our own server (so there's no
// server body-size limit — this matters for video), but our server
// decides who may upload: it checks the login and signs each upload with
// the Cloudinary API secret, which never leaves the server.
//
// Setup (.env — all three are private, none start with NEXT_PUBLIC_):
//   CLOUDINARY_CLOUD_NAME="your-cloud-name"
//   CLOUDINARY_API_KEY="your-api-key"
//   CLOUDINARY_API_SECRET="your-api-secret"
//   CLOUDINARY_FOLDER="skillverse"      (optional, default "skillverse")
// Find them in the Cloudinary Console → Settings → API Keys.
// Restart `npm run dev` after editing .env.

// Step 1: ask our server for a signed permission slip.
async function getUploadSignature() {
  let res;
  try {
    res = await fetch("/server/uploads/sign", { method: "POST" });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection.");
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error("Please log in again to upload.");
  if (!res.ok) throw new Error(data.error || "Couldn't start the upload. Try again.");
  return data;
}

// Step 2: send the file + signature to Cloudinary. Uses the /auto/upload
// endpoint so it doesn't need to be told in advance whether the file is
// an image or a video — the response's resource_type says which.
// onProgress receives 0-100 as the upload streams.
export async function uploadFileToCloudinary(file, { onProgress } = {}) {
  const sig = await getUploadSignature();

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);
    formData.append("allowed_formats", sig.allowedFormats);

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