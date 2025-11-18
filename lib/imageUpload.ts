import { AdminImageUploadPurposeTypeDTO } from "./generated-sources/openapi"
import { getImageUploadUrls } from "./apis/api"

/**
 * Upload an image file to S3 and return the final URL
 */
export async function uploadImage({
  file,
  purposeType,
}: {
  file: File
  purposeType: AdminImageUploadPurposeTypeDTO
}): Promise<string> {
  // Get file extension
  const extension = file.name.split(".").pop() || "jpg"

  // Get presigned upload URL from backend
  const result = await getImageUploadUrls({
    purposeType,
    count: 1,
    filenameExtension: extension,
  })

  const presignedUrl = result.urls[0].url
  const url = new URL(presignedUrl)

  // Upload file to S3 using presigned URL
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "x-amz-acl": "public-read",
    },
    credentials: "omit",
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("S3 Upload Error:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText,
    })
    throw new Error(`S3 upload failed: ${response.status} ${response.statusText}\n${errorText}`)
  }

  // Extract the final URL (remove query params from presigned URL)
  url.search = ""
  const finalUrl = url.toString()
  return finalUrl
}

/**
 * Upload multiple image files to S3 and return the final URLs
 */
export async function uploadImages({
  files,
  purposeType,
}: {
  files: File[]
  purposeType: AdminImageUploadPurposeTypeDTO
}): Promise<string[]> {
  // Upload all files in parallel
  const uploadPromises = files.map((file) => uploadImage({ file, purposeType }))
  return Promise.all(uploadPromises)
}
