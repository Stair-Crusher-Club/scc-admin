"use client"

import dayjs from "dayjs"
import { ExternalLink, Plus, Trash2, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { SuggestionStatusDto } from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

import {
  statusLabels,
  useConfirmSuggestion,
  useDeleteSuggestion,
  useRejectSuggestion,
  useSuggestion,
  useUpdateSuggestion,
} from "../query"

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

export default function AccessibilitySuggestionDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  const { data, isLoading } = useSuggestion(id)
  const updateMutation = useUpdateSuggestion()
  const confirmMutation = useConfirmSuggestion()
  const rejectMutation = useRejectSuggestion()
  const deleteMutation = useDeleteSuggestion()

  // Form state
  const [hasStairs, setHasStairs] = useState<boolean | null>(null)
  const [stairCount, setStairCount] = useState<number | null>(null)
  const [hasRamp, setHasRamp] = useState<boolean | null>(null)
  const [doorType, setDoorType] = useState<string>("")
  const [hasThreshold, setHasThreshold] = useState<boolean | null>(null)
  const [entrancePhotoUrls, setEntrancePhotoUrls] = useState<string[]>([])
  const [adminNote, setAdminNote] = useState<string>("")
  const [newEntrancePhotoUrl, setNewEntrancePhotoUrl] = useState("")

  // Dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null)

  // Sync form with fetched data
  useEffect(() => {
    if (data) {
      setHasStairs(data.hasStairs ?? null)
      setStairCount(data.stairCount ?? null)
      setHasRamp(data.hasRamp ?? null)
      setDoorType(data.doorType ?? "")
      setHasThreshold(data.hasThreshold ?? null)
      setEntrancePhotoUrls(data.entrancePhotoUrls ?? [])
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
          doorType: doorType || null,
          hasThreshold,
          entrancePhotoUrls,
          adminNote: adminNote || null,
        },
      })
      toast({
        title: "저장 완료",
        description: "접근성 제안이 수정되었습니다.",
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "저장 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "저장 실패",
        description: errorMessage,
      })
    }
  }

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({
        id,
        payload: { adminNote: adminNote || null },
      })
      toast({
        title: "확인 완료",
        description: "접근성 제안이 확인되었습니다. PlaceAccessibility가 생성됩니다.",
      })
      setShowConfirmDialog(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "확인 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "확인 실패",
        description: errorMessage,
      })
    }
  }

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        id,
        payload: { adminNote: adminNote || null },
      })
      toast({
        title: "반려 완료",
        description: "접근성 제안이 반려되었습니다.",
      })
      setShowRejectDialog(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "반려 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "반려 실패",
        description: errorMessage,
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      toast({
        title: "삭제 완료",
        description: "접근성 제안이 삭제되었습니다.",
      })
      setShowDeleteDialog(false)
      router.push("/accessibility-suggestion")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "삭제 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: errorMessage,
      })
    }
  }

  const addEntrancePhotoUrl = () => {
    const trimmed = newEntrancePhotoUrl.trim()
    if (!trimmed) return
    if (entrancePhotoUrls.includes(trimmed)) {
      toast({
        variant: "destructive",
        title: "중복 URL",
        description: "이미 추가된 URL입니다.",
      })
      return
    }
    setEntrancePhotoUrls((prev) => [...prev, trimmed])
    setNewEntrancePhotoUrl("")
  }

  const removeEntrancePhotoUrl = (url: string) => {
    setEntrancePhotoUrls((prev) => prev.filter((u) => u !== url))
  }

  if (isLoading) {
    return (
      <Contents.Normal>
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </Contents.Normal>
    )
  }

  if (!data) {
    return (
      <Contents.Normal>
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">데이터를 찾을 수 없습니다.</p>
        </div>
      </Contents.Normal>
    )
  }

  const isPending = data.status === SuggestionStatusDto.Pending
  const isAnyMutating =
    updateMutation.isPending || confirmMutation.isPending || rejectMutation.isPending || deleteMutation.isPending

  return (
    <Contents.Normal>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/accessibility-suggestion")}>
            목록으로
          </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Photo Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">사진</CardTitle>
          </CardHeader>
          <CardContent>
            {data.photoUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">사진이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.photoUrls.map((url, idx) => {
                  const isEntrance = entrancePhotoUrls.includes(url)
                  return (
                    <div
                      key={idx}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        isEntrance ? "border-green-500" : "border-transparent"
                      }`}
                      onClick={() => setExpandedImageUrl(url)}
                    >
                      <img
                        src={url}
                        alt={`사진 ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {isEntrance && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                          입구
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {data.photoUrls.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                클릭하여 확대 | 녹색 테두리: 입구 사진
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right: Info Form */}
        <div className="space-y-6">
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
                    id="hasStairs"
                    checked={hasStairs === true}
                    onCheckedChange={(checked) => setHasStairs(checked === true ? true : checked === false ? false : null)}
                  />
                  <Label htmlFor="hasStairs">계단 있음</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stairCount" className="text-xs">계단 수</Label>
                  <Input
                    id="stairCount"
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
                    id="hasRamp"
                    checked={hasRamp === true}
                    onCheckedChange={(checked) => setHasRamp(checked === true ? true : checked === false ? false : null)}
                  />
                  <Label htmlFor="hasRamp">경사로 있음</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasThreshold"
                    checked={hasThreshold === true}
                    onCheckedChange={(checked) => setHasThreshold(checked === true ? true : checked === false ? false : null)}
                  />
                  <Label htmlFor="hasThreshold">문턱 있음</Label>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="doorType" className="text-xs">출입문 유형</Label>
                <Input
                  id="doorType"
                  value={doorType}
                  onChange={(e) => setDoorType(e.target.value)}
                  placeholder="예: 자동문, 미닫이문"
                />
              </div>
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

          {/* Entrance Photo URL Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">입구 사진 URL 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entrancePhotoUrls.length === 0 ? (
                <p className="text-sm text-muted-foreground">입구 사진이 지정되지 않았습니다.</p>
              ) : (
                <div className="space-y-2">
                  {entrancePhotoUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted rounded-md p-2">
                      <img src={url} alt="" className="h-10 w-10 object-cover rounded" />
                      <span className="text-xs flex-1 truncate">{url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntrancePhotoUrl(url)}
                        aria-label="삭제"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newEntrancePhotoUrl}
                  onChange={(e) => setNewEntrancePhotoUrl(e.target.value)}
                  placeholder="입구 사진 URL 입력..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEntrancePhotoUrl())}
                />
                <Button variant="outline" size="sm" onClick={addEntrancePhotoUrl}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                전체 사진 목록에서 사진을 클릭한 뒤 URL을 확인하여 입구 사진을 추가하세요.
              </p>
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
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isAnyMutating}
          >
            {updateMutation.isPending ? "저장 중..." : "저장"}
          </Button>
          {isPending && (
            <>
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
                확인
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Image Expanded Dialog */}
      <Dialog open={expandedImageUrl !== null} onOpenChange={() => setExpandedImageUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>사진 확대</DialogTitle>
          </DialogHeader>
          {expandedImageUrl && (
            <div className="flex flex-col items-center gap-4">
              <img
                src={expandedImageUrl}
                alt="확대 사진"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
              <div className="flex gap-2 items-center">
                {entrancePhotoUrls.includes(expandedImageUrl) ? (
                  <Badge variant="default" className="bg-green-500">입구 사진</Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (expandedImageUrl && !entrancePhotoUrls.includes(expandedImageUrl)) {
                        setEntrancePhotoUrls((prev) => [...prev, expandedImageUrl])
                        toast({
                          title: "입구 사진 추가",
                          description: "입구 사진 목록에 추가되었습니다. 저장 버튼을 눌러 반영하세요.",
                        })
                      }
                    }}
                  >
                    입구 사진으로 지정
                  </Button>
                )}
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
              {confirmMutation.isPending ? "처리 중..." : "확인"}
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
    </Contents.Normal>
  )
}
