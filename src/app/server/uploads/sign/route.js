import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getCloudinaryConfig, signCloudinaryParams } from "@/lib/cloudinaryServer";

// Only these file types can be uploaded with a signature from this route.
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,heic,heif,mp4,mov,m4v,webm";

// Gives a logged-in user a short-lived, signed permission slip to upload
// ONE file straight to Cloudinary. The API secret stays on the server —
// the browser only receives the finished signature.
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Uploads aren't set up yet — the site owner needs to add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.",
      },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_FOLDER || "skillverse";

  // Every value signed here is locked in: if the browser changes any of
  // them, Cloudinary rejects the upload.
  const signature = signCloudinaryParams(
    { allowed_formats: ALLOWED_FORMATS, folder, timestamp },
    config.apiSecret
  );

  return NextResponse.json({
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    folder,
    allowedFormats: ALLOWED_FORMATS,
    signature,
  });
}