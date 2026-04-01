"use client"

import { Controller, UseFormReturn } from "react-hook-form"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ImageUploader from "@/components/ImageUploader"
import { AdminImageUploadPurposeTypeDTO } from "@/lib/generated-sources/openapi"

export interface PSAFormValues {
  placeId: string
  accessibilityType: string
  bbucleRoadType: string
  bbucleRoadUrl: string
  thumbnailImageUrl: string
}

export const defaultValues: PSAFormValues = {
  placeId: "",
  accessibilityType: "BBUCLE_ROAD",
  bbucleRoadType: "",
  bbucleRoadUrl: "",
  thumbnailImageUrl: "",
}

export interface SelectedPlaceInfo {
  name: string
  address?: string
}

interface PSAFormProps {
  id: string
  form: UseFormReturn<PSAFormValues>
  onSubmit: (values: PSAFormValues) => void
  isEditMode?: boolean
  isCreateMode?: boolean
  /** 선택된 장소 정보 (장소 검색으로 선택 시) */
  selectedPlace?: SelectedPlaceInfo | null
}

const bbucleRoadTypeLabel = (value: string) => {
  switch (value) {
    case "BASEBALL_STADIUM": return "야구장"
    case "CONCERT_HALL": return "공연장"
    default: return value
  }
}

export default function PSAForm({ id, form, onSubmit, isEditMode = true, isCreateMode = true, selectedPlace }: PSAFormProps) {
  const { register, handleSubmit, control, watch, formState: { errors } } = form
  const accessibilityType = watch("accessibilityType")
  // bbucleRoad 관련 필드는 accessibilityType이 BBUCLE_ROAD일 때만 required
  const isBbucleRoad = accessibilityType === "BBUCLE_ROAD"

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placeId">
              장소 <span className="text-red-500">*</span>
            </Label>
            <input type="hidden" {...register("placeId", { required: "장소를 선택해주세요" })} />
            {selectedPlace ? (
              <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                <span className="font-medium">{selectedPlace.name}</span>
                {selectedPlace.address && (
                  <span className="text-muted-foreground ml-2">{selectedPlace.address}</span>
                )}
              </div>
            ) : (
              <div className="px-3 py-2 border rounded-md text-sm text-muted-foreground">
                {isCreateMode ? "위에서 장소를 검색하여 선택하세요" : form.getValues("placeId")}
              </div>
            )}
            {errors.placeId && <p className="text-sm text-red-500">{errors.placeId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibilityType">접근성 타입</Label>
            <Controller
              name="accessibilityType"
              control={control}
              rules={{ required: "접근성 타입을 선택해주세요" }}
              render={({ field }) =>
                !isCreateMode && field.value ? (
                  <Input value={field.value} disabled />
                ) : (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!isCreateMode}>
                    <SelectTrigger id="accessibilityType">
                      <SelectValue placeholder="접근성 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BBUCLE_ROAD">BBUCLE_ROAD</SelectItem>
                    </SelectContent>
                  </Select>
                )
              }
            />
            {errors.accessibilityType && <p className="text-sm text-red-500">{errors.accessibilityType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bbucleRoadType">
              뿌클로드 타입 <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="bbucleRoadType"
              control={control}
              rules={{ required: isBbucleRoad && "뿌클로드 타입을 선택해주세요" }}
              render={({ field }) =>
                !isEditMode && field.value ? (
                  <Input value={bbucleRoadTypeLabel(field.value)} disabled />
                ) : (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!isEditMode}>
                    <SelectTrigger id="bbucleRoadType">
                      <SelectValue placeholder="뿌클로드 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASEBALL_STADIUM">야구장</SelectItem>
                      <SelectItem value="CONCERT_HALL">공연장</SelectItem>
                    </SelectContent>
                  </Select>
                )
              }
            />
            {errors.bbucleRoadType && <p className="text-sm text-red-500">{errors.bbucleRoadType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bbucleRoadUrl">
              뿌클로드 URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bbucleRoadUrl"
              {...register("bbucleRoadUrl", { required: isBbucleRoad && "뿌클로드 URL을 입력해주세요" })}
              placeholder="https://..."
              disabled={!isEditMode}
            />
            {errors.bbucleRoadUrl && <p className="text-sm text-red-500">{errors.bbucleRoadUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              썸네일 이미지 <span className="text-red-500">*</span>
            </Label>
            {isEditMode ? (
              <Controller
                name="thumbnailImageUrl"
                control={control}
                rules={{ required: isBbucleRoad && "썸네일 이미지를 업로드해주세요" }}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] ?? "")}
                    purposeType={AdminImageUploadPurposeTypeDTO.Accessibility}
                    maxImages={1}
                  />
                )}
              />
            ) : (
              <>
                {watch("thumbnailImageUrl") ? (
                  <div className="relative w-32 h-32 rounded overflow-hidden border">
                    <img
                      src={watch("thumbnailImageUrl")}
                      alt="썸네일"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </>
            )}
            {errors.thumbnailImageUrl && <p className="text-sm text-red-500">{errors.thumbnailImageUrl.message}</p>}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
