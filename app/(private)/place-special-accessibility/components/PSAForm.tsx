"use client"

import { UseFormReturn } from "react-hook-form"

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

interface PSAFormProps {
  id: string
  form: UseFormReturn<PSAFormValues>
  onSubmit: (values: PSAFormValues) => void
  isEditMode?: boolean
}

export default function PSAForm({ id, form, onSubmit, isEditMode = true }: PSAFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placeId">
              장소 ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="placeId"
              {...register("placeId", { required: "장소 ID를 입력해주세요" })}
              placeholder="장소 ID를 입력하세요"
              disabled={!isEditMode}
            />
            {errors.placeId && <p className="text-sm text-red-500">{errors.placeId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibilityType">접근성 타입</Label>
            <Select
              value={watch("accessibilityType")}
              onValueChange={(value) => setValue("accessibilityType", value)}
              disabled={!isEditMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="접근성 타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BBUCLE_ROAD">BBUCLE_ROAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bbucleRoadType">
              뿌클로드 타입 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("bbucleRoadType")}
              onValueChange={(value) => setValue("bbucleRoadType", value)}
              disabled={!isEditMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="뿌클로드 타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASEBALL_STADIUM">야구장</SelectItem>
                <SelectItem value="CONCERT_HALL">공연장</SelectItem>
              </SelectContent>
            </Select>
            {errors.bbucleRoadType && <p className="text-sm text-red-500">{errors.bbucleRoadType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bbucleRoadUrl">
              뿌클로드 URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bbucleRoadUrl"
              {...register("bbucleRoadUrl", { required: "뿌클로드 URL을 입력해주세요" })}
              placeholder="https://..."
              disabled={!isEditMode}
            />
            {errors.bbucleRoadUrl && <p className="text-sm text-red-500">{errors.bbucleRoadUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailImageUrl">
              썸네일 이미지 URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="thumbnailImageUrl"
              {...register("thumbnailImageUrl", { required: "썸네일 이미지 URL을 입력해주세요" })}
              placeholder="https://..."
              disabled={!isEditMode}
            />
            {errors.thumbnailImageUrl && <p className="text-sm text-red-500">{errors.thumbnailImageUrl.message}</p>}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
