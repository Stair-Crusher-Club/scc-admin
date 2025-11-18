"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"

import {
  BbucleRoadPageDTO,
  CreateBbucleRoadPageRequestDTO,
  UpdateBbucleRoadPageRequestDTO,
  BbucleRoadSectionDTO,
  CreateBbucleRoadSectionDTO,
  UpdateBbucleRoadSectionDTO,
} from "@/lib/generated-sources/openapi"
import {
  useBbucleRoadPage,
  useCreateBbucleRoadPage,
  useUpdateBbucleRoadPage,
} from "@/lib/apis/bbucleRoad"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Contents, Header } from "@/components/layout"
import ImageUploader from "@/components/ImageUploader"
import SectionEditor from "../components/SectionEditor"

type FormData = {
  title: string
  titleImageUrl: string
  summary: string[]
  sections: (CreateBbucleRoadSectionDTO | UpdateBbucleRoadSectionDTO)[]
}

export default function BbucleRoadEditPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string
  const isCreateMode = pageId === "create"

  const { data: page, isLoading } = useBbucleRoadPage({
    id: isCreateMode ? "" : pageId,
  })
  const { mutateAsync: createPage, isPending: isCreating } = useCreateBbucleRoadPage()
  const { mutateAsync: updatePage, isPending: isUpdating } = useUpdateBbucleRoadPage()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      titleImageUrl: "",
      summary: [],
      sections: [],
    },
  })

  const summaryValues = watch("summary") || []

  const addSummaryLine = () => {
    setValue("summary", [...summaryValues, ""])
  }

  const removeSummaryLine = (index: number) => {
    setValue("summary", summaryValues.filter((_, i) => i !== index))
  }

  const updateSummaryLine = (index: number, value: string) => {
    const newSummary = [...summaryValues]
    newSummary[index] = value
    setValue("summary", newSummary)
  }

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: "sections",
  })

  useEffect(() => {
    if (page && !isCreateMode) {
      reset({
        title: page.title,
        titleImageUrl: page.titleImageUrl,
        summary: page.summary,
        sections: page.sections as any,
      })
    }
  }, [page, isCreateMode, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isCreateMode) {
        const createData: CreateBbucleRoadPageRequestDTO = {
          title: data.title,
          titleImageUrl: data.titleImageUrl,
          summary: data.summary,
          sections: data.sections as CreateBbucleRoadSectionDTO[],
        }
        await createPage(createData)
        alert("페이지가 생성되었습니다.")
      } else {
        const updateData: UpdateBbucleRoadPageRequestDTO = {
          title: data.title,
          titleImageUrl: data.titleImageUrl,
          summary: data.summary,
          sections: data.sections as UpdateBbucleRoadSectionDTO[],
        }
        await updatePage({ id: pageId, data: updateData })
        alert("페이지가 수정되었습니다.")
      }
      router.push("/bbucleRoad")
    } catch (error) {
      alert(isCreateMode ? "페이지 생성에 실패했습니다." : "페이지 수정에 실패했습니다.")
    }
  }

  if (isLoading && !isCreateMode) {
    return (
      <>
        <Header title="뿌클로드 관리" />
        <Contents.Normal>
          <div className="text-center py-8">로딩 중...</div>
        </Contents.Normal>
      </>
    )
  }

  return (
    <>
      <Header title={isCreateMode ? "뿌클로드 페이지 생성" : "뿌클로드 페이지 편집"} />
      <Contents.Normal>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">기본 정보</h3>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("title", { required: "제목을 입력해주세요" })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="예: 휠체어로 고척 어때?"
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                {/* Title Image */}
                <ImageUploader
                  value={watch("titleImageUrl") ? [watch("titleImageUrl")] : []}
                  onChange={(urls) => setValue("titleImageUrl", urls[0] || "")}
                  purposeType="BBUCLE_ROAD_DESCRIPTION"
                  maxImages={1}
                  label="타이틀 이미지"
                  required
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">요약</h3>
                  <Button
                    type="button"
                    onClick={addSummaryLine}
                    size="sm"
                  >
                    줄 추가
                  </Button>
                </div>
                {summaryValues.length === 0 && (
                  <p className="text-sm text-muted-foreground">요약을 추가하세요.</p>
                )}
                {summaryValues.map((summary, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={summary}
                      onChange={(e) => updateSummaryLine(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder={`${index + 1}번째 요약`}
                    />
                    {summaryValues.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSummaryLine(index)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">섹션</h3>

              {sectionFields.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    섹션을 추가하여 페이지를 구성하세요.
                  </CardContent>
                </Card>
              )}

              {sectionFields.map((field, index) => {
                const currentSection = watch(`sections.${index}`)
                const firstSection = watch("sections.0")
                return (
                  <SectionEditor
                    key={field.id}
                    section={currentSection}
                    firstSectionMapConfig={index > 0 && firstSection?.mapConfig ? firstSection.mapConfig : undefined}
                    onChange={(updated) => {
                      setValue(`sections.${index}`, updated as any, { shouldDirty: true, shouldTouch: true })
                    }}
                    onRemove={() => removeSection(index)}
                    index={index}
                  />
                )
              })}

              {/* 섹션 추가 버튼 - 맨 아래로 이동 */}
              <Button
                type="button"
                onClick={() => {
                  const firstSection = watch("sections.0")
                  const newSection: CreateBbucleRoadSectionDTO = {
                    type: "MAP_OVERVIEW",
                    title: "",
                    mapConfig: firstSection?.mapConfig || undefined,
                    markers: undefined,
                    imageUrls: [],
                    order: sectionFields.length,
                  }
                  appendSection(newSection as any)
                }}
                className="w-full"
              >
                섹션 추가
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/bbucleRoad")}
                disabled={isCreating || isUpdating}
              >
                취소
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </form>
      </Contents.Normal>
    </>
  )
}
