"use client"

import { useState, useId } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

import { AdminImageUploadPurposeTypeDTO } from "@/lib/generated-sources/openapi"
import { uploadImages } from "@/lib/imageUpload"

import { Button } from "./ui/button"

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  purposeType: AdminImageUploadPurposeTypeDTO
  maxImages?: number
  label?: string
  required?: boolean
}

export default function ImageUploader({
  value,
  onChange,
  purposeType,
  maxImages = 10,
  label,
  required = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const uniqueId = useId()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check max images limit
    if (value.length + files.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    setUploading(true)
    try {
      const urls = await uploadImages({ files, purposeType })
      onChange([...value, ...urls])
    } catch (error) {
      console.error("Image upload failed:", error)
      alert("이미지 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square border rounded-md overflow-hidden">
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {value.length < maxImages && (
        <div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id={uniqueId}
            disabled={uploading}
          />
          <label htmlFor={uniqueId}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(uniqueId)?.click()
              }}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  이미지 업로드 ({value.length}/{maxImages})
                </>
              )}
            </Button>
          </label>
        </div>
      )}

      {value.length === 0 && required && (
        <p className="text-sm text-muted-foreground">최소 1개 이상의 이미지가 필요합니다.</p>
      )}
    </div>
  )
}
