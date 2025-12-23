"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Edit, Plus, RotateCcw, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import {
  createPlaceCategoryCache,
  deletePlaceCategoryCache,
  updatePlaceCategoryCache,
  usePlaceCategoryCaches,
} from "@/lib/apis/api"
import { AdminPlaceCategoryCacheDto, PlaceCategoryDto } from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CreateFormValues {
  categoryString: string
  placeCategory: PlaceCategoryDto | ""
}

interface EditFormValues {
  placeCategory: PlaceCategoryDto | ""
}

function isValidPlaceCategory(value: PlaceCategoryDto | ""): value is PlaceCategoryDto {
  return value !== "" && Object.values(PlaceCategoryDto).includes(value)
}

const PLACE_CATEGORIES: { value: PlaceCategoryDto; label: string }[] = [
  { value: PlaceCategoryDto.Market, label: "마트" },
  { value: PlaceCategoryDto.ConvenienceStore, label: "편의점" },
  { value: PlaceCategoryDto.Kindergarten, label: "유치원" },
  { value: PlaceCategoryDto.School, label: "학교" },
  { value: PlaceCategoryDto.Academy, label: "학원" },
  { value: PlaceCategoryDto.ParkingLot, label: "주차장" },
  { value: PlaceCategoryDto.GasStation, label: "주유소" },
  { value: PlaceCategoryDto.SubwayStation, label: "지하철역" },
  { value: PlaceCategoryDto.Bank, label: "은행" },
  { value: PlaceCategoryDto.CulturalFacilities, label: "문화시설" },
  { value: PlaceCategoryDto.Agency, label: "대행사" },
  { value: PlaceCategoryDto.PublicOffice, label: "공공기관" },
  { value: PlaceCategoryDto.Attraction, label: "관광지" },
  { value: PlaceCategoryDto.Accomodation, label: "숙박" },
  { value: PlaceCategoryDto.Restaurant, label: "음식점" },
  { value: PlaceCategoryDto.Cafe, label: "카페" },
  { value: PlaceCategoryDto.Hospital, label: "병원" },
  { value: PlaceCategoryDto.Pharmacy, label: "약국" },
]

function getCategoryLabel(category: PlaceCategoryDto): string {
  return PLACE_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export default function PlaceCategoryCachePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Filter states
  const [filterCategory, setFilterCategory] = useState<PlaceCategoryDto | undefined>()
  const [filterCategoryString, setFilterCategoryString] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<AdminPlaceCategoryCacheDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // React Hook Form for Create dialog
  const createForm = useForm<CreateFormValues>({
    defaultValues: {
      categoryString: "",
      placeCategory: "",
    },
  })

  // React Hook Form for Edit dialog
  const editForm = useForm<EditFormValues>({
    defaultValues: {
      placeCategory: "",
    },
  })

  // Reset edit form when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      editForm.reset({ placeCategory: selectedItem.placeCategory })
    }
  }, [selectedItem, editForm])

  const { data, fetchNextPage, hasNextPage, refetch, isLoading } = usePlaceCategoryCaches({
    placeCategory: filterCategory,
    categoryStringContains: filterCategoryString || undefined,
    limit: 50,
  })

  const items: AdminPlaceCategoryCacheDto[] = data?.pages.flatMap((p) => p.items) ?? []

  const handleSearch = () => {
    setFilterCategoryString(searchInput)
  }

  const handleReset = () => {
    setFilterCategory(undefined)
    setFilterCategoryString("")
    setSearchInput("")
  }

  const handleCreateOpen = () => {
    createForm.reset({ categoryString: "", placeCategory: "" })
    setShowCreateDialog(true)
  }

  const handleEditOpen = (item: AdminPlaceCategoryCacheDto) => {
    setSelectedItem(item)
    editForm.reset({ placeCategory: item.placeCategory })
    setShowEditDialog(true)
  }

  const handleDeleteOpen = (item: AdminPlaceCategoryCacheDto) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (!isValidPlaceCategory(values.placeCategory)) {
      return
    }

    try {
      await createPlaceCategoryCache({
        categoryString: values.categoryString.trim(),
        placeCategory: values.placeCategory,
      })
      toast({
        title: "생성 완료",
        description: "장소 카테고리 캐시가 생성되었습니다.",
      })
      setShowCreateDialog(false)
      createForm.reset()
      queryClient.invalidateQueries({ queryKey: ["@placeCategoryCaches"] })
    } catch (error: any) {
      const errorMessage =
        error.response?.status === 409
          ? "이미 동일한 카테고리 문자열이 존재합니다."
          : error.response?.data?.message || error.message || "생성 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "생성 실패",
        description: errorMessage,
      })
    }
  })

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!selectedItem || !isValidPlaceCategory(values.placeCategory)) {
      return
    }

    try {
      await updatePlaceCategoryCache({
        id: selectedItem.id,
        payload: { placeCategory: values.placeCategory },
      })
      toast({
        title: "수정 완료",
        description: "장소 카테고리 캐시가 수정되었습니다.",
      })
      setShowEditDialog(false)
      setSelectedItem(null)
      editForm.reset()
      queryClient.invalidateQueries({ queryKey: ["@placeCategoryCaches"] })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "수정 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "수정 실패",
        description: errorMessage,
      })
    }
  })

  const handleDelete = async () => {
    if (!selectedItem) return

    setIsDeleting(true)
    try {
      await deletePlaceCategoryCache({ id: selectedItem.id })
      toast({
        title: "삭제 완료",
        description: "장소 카테고리 캐시가 삭제되었습니다. 다음 조회 시 AI가 다시 카테고리를 판정합니다.",
      })
      setShowDeleteDialog(false)
      setSelectedItem(null)
      queryClient.invalidateQueries({ queryKey: ["@placeCategoryCaches"] })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "삭제 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: errorMessage,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<AdminPlaceCategoryCacheDto>[] = [
    {
      accessorKey: "categoryString",
      header: ({ column }) => <DataTableColumnHeader column={column} title="카테고리 문자열" />,
      cell: ({ row }) => <div className="font-mono text-sm">{row.original.categoryString}</div>,
    },
    {
      accessorKey: "placeCategory",
      header: ({ column }) => <DataTableColumnHeader column={column} title="장소 카테고리" />,
      cell: ({ row }) => <div className="text-center">{getCategoryLabel(row.original.placeCategory)}</div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="생성일" />,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground">
          {dayjs(row.original.createdAt.value).format("YYYY-MM-DD HH:mm")}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="수정일" />,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground">
          {dayjs(row.original.updatedAt.value).format("YYYY-MM-DD HH:mm")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center font-semibold">작업</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditOpen(row.original)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteOpen(row.original)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Contents.Normal>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>장소 카테고리 캐시 관리</CardTitle>
          <CardDescription>
            지도 API에서 반환된 카테고리 문자열을 장소 카테고리로 매핑한 캐시를 관리합니다. 캐시를 삭제하면 다음 조회 시
            AI가 다시 카테고리를 판정합니다. 캐시를 수정하면 해당 장소가 다시 검색 되었을 때 적용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>장소 카테고리</Label>
              <Select
                value={filterCategory ?? "all"}
                onValueChange={(value) => setFilterCategory(value === "all" ? undefined : (value as PlaceCategoryDto))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {PLACE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>카테고리 문자열 검색</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="검색어 입력..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                초기화
              </Button>
              <Button onClick={handleCreateOpen} className="gap-2">
                <Plus className="h-4 w-4" />
                새로 추가
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={items} hasMore={hasNextPage} onLoadMore={() => fetchNextPage()} />
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">총 {items.length}개 항목</div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>장소 카테고리 캐시 추가</DialogTitle>
            <DialogDescription>지도 API의 카테고리 문자열을 장소 카테고리로 매핑합니다.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryString">카테고리 문자열</Label>
                <Input
                  id="categoryString"
                  placeholder="예: 음식점 > 한식 > 불고기, 두루치기"
                  {...createForm.register("categoryString", {
                    required: "카테고리 문자열을 입력해주세요.",
                    validate: (value) => value.trim() !== "" || "카테고리 문자열을 입력해주세요.",
                  })}
                />
                {createForm.formState.errors.categoryString && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.categoryString.message}</p>
                )}
                <p className="text-xs text-muted-foreground">지도 API에서 반환되는 원본 카테고리 문자열을 입력하세요.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeCategory">장소 카테고리</Label>
                <Controller
                  name="placeCategory"
                  control={createForm.control}
                  rules={{ required: "장소 카테고리를 선택해주세요." }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="placeCategory">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLACE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {createForm.formState.errors.placeCategory && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.placeCategory.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} disabled={createForm.formState.isSubmitting}>
                취소
              </Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "추가 중..." : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>장소 카테고리 수정</DialogTitle>
            <DialogDescription>해당 카테고리 문자열의 장소 카테고리를 수정합니다.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>카테고리 문자열</Label>
                <div className="rounded-md bg-muted p-3 font-mono text-sm">{selectedItem?.categoryString}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPlaceCategory">장소 카테고리</Label>
                <Controller
                  name="placeCategory"
                  control={editForm.control}
                  rules={{ required: "장소 카테고리를 선택해주세요." }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="editPlaceCategory">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLACE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {editForm.formState.errors.placeCategory && (
                  <p className="text-xs text-destructive">{editForm.formState.errors.placeCategory.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} disabled={editForm.formState.isSubmitting}>
                취소
              </Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? "수정 중..." : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>삭제 확인</DialogTitle>
            <DialogDescription>정말로 이 장소 카테고리 캐시를 삭제하시겠습니까?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                <span className="font-semibold">카테고리 문자열:</span>{" "}
                <span className="font-mono">{selectedItem?.categoryString}</span>
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">현재 카테고리:</span>{" "}
                {selectedItem && getCategoryLabel(selectedItem.placeCategory)}
              </p>
            </div>
            <p className="mt-4 text-sm text-yellow-600">삭제 후 다음 조회 시 AI가 다시 카테고리를 판정합니다.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Contents.Normal>
  )
}
