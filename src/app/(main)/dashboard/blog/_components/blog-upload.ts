/**
 * Uploads an image straight to Cloudflare R2 using a presigned URL from the
 * API, so the bytes never pass through this app or the API server. The API
 * chooses the object key and binds the content type into the signature, so the
 * browser only supplies the file itself.
 */
export async function uploadImageToR2(file: File): Promise<string> {
  const presignResponse = await fetch("/api/blog/uploads/presign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentType: file.type }),
  });

  const presignBody = (await presignResponse.json().catch(() => null)) as {
    data?: { uploadUrl: string; publicUrl: string; requiredHeaders: Record<string, string> };
    message?: string;
  } | null;

  if (!presignResponse.ok || !presignBody?.data) {
    throw new Error(presignBody?.message ?? "Unable to prepare the upload.");
  }

  const { uploadUrl, publicUrl, requiredHeaders } = presignBody.data;

  // The signed content-type must be sent verbatim or R2 rejects the signature.
  const upload = await fetch(uploadUrl, { method: "PUT", headers: requiredHeaders, body: file });

  if (!upload.ok) {
    throw new Error("Upload to storage failed. Check the bucket's CORS rules.");
  }

  return publicUrl;
}
