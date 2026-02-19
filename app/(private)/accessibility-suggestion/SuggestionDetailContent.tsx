"use client"

import dayjs from "dayjs"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ExternalLink, Plus, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { AdminEntranceDoorType, AdminImageUploadPurposeTypeDTO, SuggestionStatusDto } from "@/lib/generated-sources/openapi"
import { uploadImages } from "@/lib/imageUpload"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-toastify"

import {
  statusLabels,
  useConfirmSuggestion,
  useDeleteSuggestion,
  useRejectSuggestion,
  useRevertSuggestion,
  useSuggestion,
  useUpdateSuggestion,
} from "./query"

function getStatusBadgeVariant(status: SuggestionStatusDto): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case SuggestionStatusDto.Pending:
      return "outline"
    case SuggestionStatusDto.Confirmed:
      return "default"
    case SuggestionStatusDto.Rejected:
      return "destructive"
    default:
      return "secondary"
  }
}

interface SuggestionDetailContentProps {
  id: string
  onClose?: () => void
  onDeleted?: () => void
}

export function SuggestionDetailContent({ id, onClose, onDeleted }: SuggestionDetailContentProps) {


  const { data, isLoading } = useSuggestion(id)
  const updateMutation = useUpdateSuggestion()
  const confirmMutation = useConfirmSuggestion()
  const rejectMutation = useRejectSuggestion()
  const deleteMutation = useDeleteSuggestion()
  const revertMutation = useRevertSuggestion()

  // Form state
  const [hasStairs, setHasStairs] = useState<boolean | null>(null)
  const [stairCount, setStairCount] = useState<number | null>(null)
  const [hasRamp, setHasRamp] = useState<boolean | null>(null)
  const [doorTypes, setDoorTypes] = useState<string[]>([])
  const [stairHeightLevel, setStairHeightLevel] = useState<string>("")
  const [hasThreshold, setHasThreshold] = useState<boolean | null>(null)
  const [entrancePhotoUrls, setEntrancePhotoUrls] = useState<string[]>([])
  const [localPhotoUrls, setLocalPhotoUrls] = useState<string[]>([])
  const [adminNote, setAdminNote] = useState<string>("")

  // Upload state
  const [isUploading, setIsUploading] = useState(false)

  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null)

  // Sync form with fetched data
  useEffect(() => {
    if (data) {
      setHasStairs(data.hasStairs ?? null)
      setStairCount(data.stairCount ?? null)
      setHasRamp(data.hasRamp ?? null)
      setDoorTypes(data.doorTypes ?? [])
      setStairHeightLevel(data.stairHeightLevel ?? "")
      setHasThreshold(data.hasThreshold ?? null)
      setEntrancePhotoUrls(data.entrancePhotoUrls ?? [])
      setLocalPhotoUrls(data.photoUrls ?? [])
      setAdminNote(data.adminNote ?? "")
    }
  }, [data])

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          hasStairs,
          stairCount,
          hasRamp,
          doorTypes: doorTypes.length > 0 ? doorTypes : null,
          stairHeightLevel: stairHeightLevel || null,
          hasThreshold,
          photoUrls: localPhotoUrls,
          entrancePhotoUrls,
          adminNote: adminNote || null,
        },
      })
      toast.success("접근성 제안이 수정되었습니다.")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "저장 중 오류가 발생했습니다."
      toast.error(`저장 실패: ${errorMessage}`)
    }
  }

  const handleConfirm = async () => {
    try {
      // 먼저 수정된 필드를 저장한 후 승인 처리
      await updateMutation.mutateAsync({
        id,
        payload: {
          hasStairs,
          stairCount,
          hasRamp,
          doorTypes: doorTypes.length > 0 ? doorTypes : null,
          stairHeightLevel: stairHeightLevel || null,
          hasThreshold,
          photoUrls: localPhotoUrls,
          entrancePhotoUrls,
          adminNote: adminNote || null,
        },
      })
      await confirmMutation.mutateAsync({
        id,
        payload: { adminNote: adminNote || null },
      })
      setShowConfirmDialog(false)
      toast.success("접근성 제안이 승인되었습니다.")
      onClose?.()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "확인 중 오류가 발생했습니다."
      toast.error(`확인 실패: ${errorMessage}`)
    }
  }

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        id,
        payload: { adminNote: adminNote || null },
      })
      setShowRejectDialog(false)
      toast.success("접근성 제안이 반려되었습니다.")
      onClose?.()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "반려 중 오류가 발생했습니다."
      toast.error(`반려 실패: ${errorMessage}`)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      setShowDeleteDialog(false)
      toast.success("접근성 제안이 삭제되었습니다.")
      onDeleted?.()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "삭제 중 오류가 발생했습니다."
      toast.error(`삭제 실패: ${errorMessage}`)
    }
  }

  const handleRevert = async () => {
    if (
      !window.confirm(
        "이 제안을 대기 상태로 되돌리시겠습니까?" +
          (data?.status === "CONFIRMED" ? " 등록된 접근성 정보도 삭제됩니다." : ""),
      )
    )
      return
    try {
      await revertMutation.mutateAsync({ id })
      toast.success("대기 상태로 되돌렸습니다.")
      onClose?.()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "되돌리기 중 오류가 발생했습니다."
      toast.error(`되돌리기 실패: ${errorMessage}`)
    }
  }

  const handleDeletePhoto = async (url: string) => {
    if (!window.confirm("이 사진을 삭제하시겠습니까?")) return

    const newPhotoUrls = localPhotoUrls.filter((u) => u !== url)
    const newEntrancePhotoUrls = entrancePhotoUrls.filter((u) => u !== url)

    setLocalPhotoUrls(newPhotoUrls)
    setEntrancePhotoUrls(newEntrancePhotoUrls)

    // Persist entrance photo changes via update API
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          hasStairs,
          stairCount,
          hasRamp,
          doorTypes: doorTypes.length > 0 ? doorTypes : null,
          stairHeightLevel: stairHeightLevel || null,
          hasThreshold,
          photoUrls: newPhotoUrls,
          entrancePhotoUrls: newEntrancePhotoUrls,
          adminNote: adminNote || null,
        },
      })
      toast.success(
        entrancePhotoUrls.includes(url)
          ? "사진이 삭제되었습니다. (입구 사진에서도 제거됨)"
          : "사진이 삭제되었습니다.",
      )
    } catch (error: any) {
      // Revert on failure
      setLocalPhotoUrls(localPhotoUrls)
      setEntrancePhotoUrls(entrancePhotoUrls)
      const errorMessage = error.response?.data?.message || error.message || "사진 삭제 중 오류가 발생했습니다."
      toast.error(`사진 삭제 실패: ${errorMessage}`)
    }
  }

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const urls = await uploadImages({
        files: Array.from(files),
        purposeType: AdminImageUploadPurposeTypeDTO.PlaceAccessibilitySuggestion,
      })
      const newPhotoUrls = [...localPhotoUrls, ...urls]
      setLocalPhotoUrls(newPhotoUrls)

      // Persist via update API
      await updateMutation.mutateAsync({
        id,
        payload: {
          hasStairs,
          stairCount,
          hasRamp,
          doorTypes: doorTypes.length > 0 ? doorTypes : null,
          stairHeightLevel: stairHeightLevel || null,
          hasThreshold,
          photoUrls: newPhotoUrls,
          entrancePhotoUrls,
          adminNote: adminNote || null,
        },
      })
      toast.success(`${urls.length}장의 사진이 추가되었습니다.`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "사진 업로드 중 오류가 발생했습니다."
      toast.error(`사진 추가 실패: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Image navigation
  const photoUrls = localPhotoUrls
  const totalPhotos = photoUrls.length

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (expandedImageIndex === null || totalPhotos === 0) return
      if (direction === "prev") {
        setExpandedImageIndex((expandedImageIndex - 1 + totalPhotos) % totalPhotos)
      } else {
        setExpandedImageIndex((expandedImageIndex + 1) % totalPhotos)
      }
    },
    [expandedImageIndex, totalPhotos],
  )

  // Keyboard navigation for image modal
  useEffect(() => {
    if (expandedImageIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        navigateImage("prev")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        navigateImage("next")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [expandedImageIndex, navigateImage])

  const expandedImageUrl = expandedImageIndex !== null ? photoUrls[expandedImageIndex] ?? null : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">데이터를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const isPending = data.status === SuggestionStatusDto.Pending
  const isAnyMutating =
    updateMutation.isPending || confirmMutation.isPending || rejectMutation.isPending || deleteMutation.isPending || revertMutation.isPending

  return (
    <div className="min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          )}
          <h1 className="text-xl font-semibold">{data.placeName}</h1>
          <Badge variant={getStatusBadgeVariant(data.status)}>
            {statusLabels[data.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>생성: {dayjs(data.createdAtMillis).format("YYYY-MM-DD HH:mm")}</span>
          {data.reviewedAtMillis && (
            <span>| 검토: {dayjs(data.reviewedAtMillis).format("YYYY-MM-DD HH:mm")}</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Photo Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">사진</CardTitle>
          </CardHeader>
          <CardContent>
            {localPhotoUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">사진이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {localPhotoUrls.map((url, idx) => {
                  const isEntrance = entrancePhotoUrls.includes(url)
                  return (
                    <div
                      key={idx}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors group ${
                        isEntrance ? "border-green-500" : "border-transparent"
                      }`}
                      onClick={() => setExpandedImageIndex(idx)}
                    >
                      <img
                        src={url}
                        alt={`사진 ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {isEntrance && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                          입구 {entrancePhotoUrls.length > 1 && `${entrancePhotoUrls.indexOf(url) + 1}`}
                        </div>
                      )}
                      <button
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhoto(url)
                        }}
                        aria-label="사진 삭제"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {localPhotoUrls.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                클릭하여 확대 | 녹색 테두리: 입구 사진 | 호버하여 삭제
              </p>
            )}
            <div className="mt-3">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md cursor-pointer hover:bg-accent transition-colors">
                <Plus className="h-4 w-4" />
                {isUploading ? "업로드 중..." : "사진 추가"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    handleAddPhotos(e.target.files)
                    e.target.value = ""
                  }}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Place Info (readonly) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">장소 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">장소명</Label>
                <p className="text-sm font-medium">{data.placeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">네이버 플레이스</Label>
                {data.naverPlaceId ? (
                  <a
                    href={`https://m.place.naver.com/place/${data.naverPlaceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    링크 열기
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">주소</Label>
                <p className="text-sm">{data.addressFromCrawl ?? "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">카테고리</Label>
                <p className="text-sm">{data.categoryFromCrawl ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Info (editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">접근성 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`hasStairs-${id}`}
                  checked={hasStairs === true}
                  onCheckedChange={(checked) => setHasStairs(checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor={`hasStairs-${id}`}>계단 있음</Label>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`stairCount-${id}`} className="text-xs">계단 수</Label>
                <Input
                  id={`stairCount-${id}`}
                  type="number"
                  min={0}
                  value={stairCount ?? ""}
                  onChange={(e) => setStairCount(e.target.value ? Number(e.target.value) : null)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`hasRamp-${id}`}
                  checked={hasRamp === true}
                  onCheckedChange={(checked) => setHasRamp(checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor={`hasRamp-${id}`}>경사로 있음</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`hasThreshold-${id}`}
                  checked={hasThreshold === true}
                  onCheckedChange={(checked) => setHasThreshold(checked === true ? true : checked === false ? false : null)}
                />
                <Label htmlFor={`hasThreshold-${id}`}>문턱 있음</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">출입문 유형 (복수 선택 가능)</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: AdminEntranceDoorType.None, label: "없음 (문 없음)" },
                  { value: AdminEntranceDoorType.Hinged, label: "여닫이문" },
                  { value: AdminEntranceDoorType.Sliding, label: "미닫이문" },
                  { value: AdminEntranceDoorType.Revolving, label: "회전문" },
                  { value: AdminEntranceDoorType.Automatic, label: "자동문" },
                  { value: AdminEntranceDoorType.Etc, label: "기타" },
                ].map(({ value, label }) => {
                  const isNone = value === AdminEntranceDoorType.None
                  const isChecked = doorTypes.includes(value)
                  const isDisabled = !isNone && doorTypes.includes(AdminEntranceDoorType.None)
                  return (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`doorType-${id}-${value}`}
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={(checked) => {
                          if (isNone) {
                            setDoorTypes(checked ? [AdminEntranceDoorType.None] : [])
                          } else {
                            setDoorTypes((prev) =>
                              checked
                                ? [...prev.filter((v) => v !== AdminEntranceDoorType.None), value]
                                : prev.filter((v) => v !== value),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={`doorType-${id}-${value}`} className={isDisabled ? "text-muted-foreground" : ""}>
                        {label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
            {stairCount === 1 && (
              <div className="space-y-1">
                <Label htmlFor={`stairHeightLevel-${id}`} className="text-xs">턱 높이</Label>
                <Select value={stairHeightLevel || "__unset__"} onValueChange={(v) => setStairHeightLevel(v === "__unset__" ? "" : v)}>
                  <SelectTrigger id={`stairHeightLevel-${id}`}>
                    <SelectValue placeholder="선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unset__">미지정</SelectItem>
                    <SelectItem value="HALF_THUMB">엄지 한마디</SelectItem>
                    <SelectItem value="THUMB">엄지 손가락</SelectItem>
                    <SelectItem value="OVER_THUMB">엄지 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis (readonly) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">AI 신뢰도</Label>
              <p className="text-sm font-medium">{data.aiConfidence ?? "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">AI 판단 근거</Label>
              <p className="text-sm whitespace-pre-wrap bg-muted rounded-md p-3">
                {data.aiReasoning ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Note */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">관리자 메모</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="관리자 메모를 입력하세요..."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t">
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isAnyMutating}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          삭제
        </Button>
        <div className="flex gap-2">
          {isPending && (
            <>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isAnyMutating}
              >
                {updateMutation.isPending ? "저장 중..." : "임시 저장"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={isAnyMutating}
              >
                반려
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={isAnyMutating}
              >
                승인 및 정보 저장
              </Button>
            </>
          )}
          {(data.status === SuggestionStatusDto.Confirmed || data.status === SuggestionStatusDto.Rejected) && (
            <Button
              variant="outline"
              onClick={handleRevert}
              disabled={isAnyMutating}
            >
              {revertMutation.isPending ? "되돌리는 중..." : "대기로 되돌리기"}
            </Button>
          )}
        </div>
      </div>

      {/* Image Expanded Dialog with Navigation */}
      <Dialog open={expandedImageIndex !== null} onOpenChange={() => setExpandedImageIndex(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              사진 확대
              {totalPhotos > 0 && expandedImageIndex !== null && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {expandedImageIndex + 1} / {totalPhotos}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {expandedImageUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center justify-center">
                {/* Left arrow */}
                {totalPhotos > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateImage("prev")
                    }}
                    aria-label="이전 사진"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}

                <img
                  src={expandedImageUrl}
                  alt="확대 사진"
                  className="max-w-full max-h-[70vh] object-contain rounded px-12"
                />

                {/* Right arrow */}
                {totalPhotos > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateImage("next")
                    }}
                    aria-label="다음 사진"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2 items-center flex-wrap justify-center">
                {(() => {
                  const entranceIdx = entrancePhotoUrls.indexOf(expandedImageUrl)
                  const isEntrance = entranceIdx !== -1
                  if (isEntrance) {
                    return (
                      <>
                        <Badge variant="default" className="bg-green-500">
                          입구 사진 {entrancePhotoUrls.length > 1 && `(${entranceIdx + 1}/${entrancePhotoUrls.length})`}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={entranceIdx === 0}
                          onClick={() => {
                            setEntrancePhotoUrls((prev) => {
                              const next = [...prev]
                              ;[next[entranceIdx - 1], next[entranceIdx]] = [next[entranceIdx], next[entranceIdx - 1]]
                              return next
                            })
                          }}
                        >
                          <ChevronUp className="h-4 w-4 mr-1" />
                          앞으로
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={entranceIdx === entrancePhotoUrls.length - 1}
                          onClick={() => {
                            setEntrancePhotoUrls((prev) => {
                              const next = [...prev]
                              ;[next[entranceIdx], next[entranceIdx + 1]] = [next[entranceIdx + 1], next[entranceIdx]]
                              return next
                            })
                          }}
                        >
                          <ChevronDown className="h-4 w-4 mr-1" />
                          뒤로
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setEntrancePhotoUrls((prev) => prev.filter((u) => u !== expandedImageUrl))
                            toast.info("입구 사진 목록에서 제거되었습니다. 저장 버튼을 눌러 반영하세요.")
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          해제
                        </Button>
                      </>
                    )
                  }
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (expandedImageUrl) {
                          setEntrancePhotoUrls((prev) => [...prev, expandedImageUrl])
                          toast.info("입구 사진 목록에 추가되었습니다. 저장 버튼을 눌러 반영하세요.")
                        }
                      }}
                    >
                      입구 사진으로 지정
                    </Button>
                  )
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (expandedImageUrl) {
                      window.open(expandedImageUrl, "_blank")
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  새 탭에서 열기
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (expandedImageUrl) {
                      setExpandedImageIndex(null)
                      handleDeletePhoto(expandedImageUrl)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>접근성 제안 확인</DialogTitle>
            <DialogDescription>
              이 제안을 확인하면 PlaceAccessibility가 생성됩니다. 계속하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-semibold">{data.placeName}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.addressFromCrawl}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={confirmMutation.isPending}>
              취소
            </Button>
            <Button onClick={handleConfirm} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? "처리 중..." : "승인 및 정보 저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>접근성 제안 반려</DialogTitle>
            <DialogDescription>
              이 제안을 반려하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-semibold">{data.placeName}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.addressFromCrawl}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={rejectMutation.isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "처리 중..." : "반려"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>접근성 제안 삭제</DialogTitle>
            <DialogDescription>
              이 제안을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-semibold">{data.placeName}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.addressFromCrawl}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteMutation.isPending}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
