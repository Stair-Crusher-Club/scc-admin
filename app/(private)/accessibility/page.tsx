"use client"

import { format } from "date-fns"
import dayjs from "dayjs"
import { Search } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { SearchAccessibilitiesPayload } from "@/lib/apis/api"
import {
  AdminAccessibilityDTO,
  AdminBuildingAccessibilityDTO,
} from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Contents, Header } from "@/components/layout"

import { ActionsCell, ImagesCell } from "./components/Cells"
import { useAccessibilities } from "./query"

export default function AccessibilityList() {
  const form = useForm<SearchAccessibilitiesPayload>()
  const [formInput, setFormInput] = useState<SearchAccessibilitiesPayload>({
    placeName: "",
    createdAtFromLocalDate: "",
    createdAtToLocalDate: "",
  })
  const { data, fetchNextPage, hasNextPage } = useAccessibilities(formInput)
  const accessibilities = data?.pages.flatMap((p) => p.items) ?? []

  const updateFormInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const placeName = formData.get("placeName") as string
    const createdAtFrom = formData.get("createdAtFromLocalDate") as string
    const createdAtTo = formData.get("createdAtToLocalDate") as string

    setFormInput({
      placeName: placeName || "",
      createdAtFromLocalDate: createdAtFrom
        ? format(new Date(createdAtFrom), "yyyy-MM-dd")
        : "",
      createdAtToLocalDate: createdAtTo
        ? format(new Date(createdAtTo), "yyyy-MM-dd")
        : "",
    })
  }

  return (
    <>
      <Header title="등록된 정보 관리" />
      <Contents.Normal>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>검색 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="search-accessibilities" onSubmit={updateFormInput}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="placeName">장소명</Label>
                  <Input
                    id="placeName"
                    name="placeName"
                    type="text"
                    placeholder="등록 최신순 검색"
                    defaultValue={formInput.placeName}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="createdAtFromLocalDate">정보 등록 시작일</Label>
                    <Input
                      id="createdAtFromLocalDate"
                      name="createdAtFromLocalDate"
                      type="date"
                      defaultValue={formInput.createdAtFromLocalDate}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="createdAtToLocalDate">정보 등록 종료일</Label>
                    <Input
                      id="createdAtToLocalDate"
                      name="createdAtToLocalDate"
                      type="date"
                      defaultValue={formInput.createdAtToLocalDate}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">장소 사진</TableHead>
                    <TableHead className="w-[200px]">건물 사진</TableHead>
                    <TableHead>촬영 정보</TableHead>
                    <TableHead className="w-[200px]">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessibilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    accessibilities.map((row) => (
                      <TableRow key={row.placeAccessibility.id}>
                        <TableCell>
                          <ImagesCell
                            images={row.placeAccessibility.images.map(
                              (item) => item.thumbnailUrl ?? item.imageUrl
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <ImagesCell
                            images={mergeBuildingAccessibilityImages(
                              row.buildingAccessibility
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">장소:</span>{" "}
                              {row.placeAccessibility.placeName}
                            </p>
                            <p>
                              <span className="font-medium">촬영:</span>{" "}
                              {row.placeAccessibility.registeredUserName}
                            </p>
                            <p>
                              <span className="font-medium">시각:</span>{" "}
                              {dayjs(row.placeAccessibility.createdAtMillis).format(
                                "YYYY-MM-DD HH:mm"
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ActionsCell accessibility={row} ctx={formInput} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <Button onClick={() => fetchNextPage()} variant="outline">
              더 불러오기
            </Button>
          </div>
        )}
      </Contents.Normal>
    </>
  )
}

const mergeBuildingAccessibilityImages = (
  buildingAccessibility?: AdminBuildingAccessibilityDTO
) => {
  const imageUrls: string[] = []
  if (buildingAccessibility == null) return imageUrls

  if (buildingAccessibility.entranceImages.length > 0) {
    buildingAccessibility.entranceImages.forEach((image) => {
      imageUrls.push(image.thumbnailUrl ?? image.imageUrl)
    })
  }
  if (buildingAccessibility.elevatorImages.length > 0) {
    buildingAccessibility.elevatorImages.forEach((image) => {
      imageUrls.push(image.thumbnailUrl ?? image.imageUrl)
    })
  }

  return imageUrls
}
