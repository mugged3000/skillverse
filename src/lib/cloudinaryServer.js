import crypto from "crypto";

// Server-only Cloudinary helpers. These read the PRIVATE env vars (no
// NEXT_PUBLIC_ prefix), so the API secret never reaches the browser.
export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary's signing rule: sort the parameters by name, join them as
// "key=value&key=value", append the API secret, and SHA-1 the result.
export function signCloudinaryParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}