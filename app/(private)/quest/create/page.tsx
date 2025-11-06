"use client"

import { Combobox, DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { ClubQuestCreateRegionType, createQuest, previewDivisions } from "@/lib/apis/api"
import { ClubQuestCreateDryRunResultItemDTO, ClubQuestPurposeTypeEnumDTO } from "@/lib/generated-sources/openapi"

import Map from "@/components/Map"
import { Circle, ClusterMarker, Polygon } from "@/components/Map/components"
import { Contents, Header } from "@/components/layout"
import { Flex } from "@/styles/jsx"

import * as S from "./page.style"

const purposeTypeOptions: { label: string; value: ClubQuestPurposeTypeEnumDTO }[] = [
  { label: "크러셔 클럽", value: "CRUSHER_CLUB" },
  { label: "일상 퀘스트", value: "DAILY_CLUB" },
  { label: "콜라보 클럽", value: "COLLABO_CLUB" },
  { label: "ESG 파트너스", value: "ESG_PARTNERS" },
]

const questTargetPlaceCategoryOptions = [
  { label: "음식점", value: "RESTAURANT" } as const,
  { label: "카페", value: "CAFE" } as const,
  { label: "편의점", value: "CONVENIENCE_STORE" } as const,
  { label: "대형마트", value: "MARKET" } as const,
  { label: "병원", value: "HOSPITAL" } as const,
  { label: "약국", value: "PHARMACY" } as const,
]

type PlaceSearchMethod = "SEARCH_NOW" | "USE_ALREADY_CRAWLED_PLACES"
const placeSearchMethodOptions: { label: string; value: PlaceSearchMethod }[] = [
  { label: "지금 크롤링하기", value: "SEARCH_NOW" },
  { label: "이미 크롤링된 장소 사용하기", value: "USE_ALREADY_CRAWLED_PLACES" },
]

const methodOptions: { label: string; value: ClubQuestCreateRegionType }[] = [
  { label: "지점 - 반경", value: "CIRCLE" },
  { label: "다각형 그리기", value: "POLYGON" },
]

interface FormValues {
  name: string
  purposeType: (typeof purposeTypeOptions)[number]
  startDate: Date
  endDate: Date
  questTargetPlaceCategories: typeof questTargetPlaceCategoryOptions
  method: (typeof methodOptions)[number]
  placeSearchMethod: (typeof placeSearchMethodOptions)[number]
  center: { lat: number; lng: number }
  points: { lat: number; lng: number }[]
  radius: number
  division: number
  maxPlacesPerQuest: number
}

export default function QuestCreate() {
  const router = useRouter()
  // 센터 모드 : 중심점 설정 모드
  // 프리뷰 모드 : 조 분할 미리보기 모드
  const mode = useRef<"draw" | "preview">("draw")
  const queryClient = useQueryClient()
  const [showPreview, setShowPreview] = useState(false)
  const [isPreviewLoading, setPreviewLoading] = useState(false)
  const form = useForm<FormValues>({
    defaultValues: {
      purposeType: purposeTypeOptions[0],
      questTargetPlaceCategories: questTargetPlaceCategoryOptions,
      placeSearchMethod: placeSearchMethodOptions[0],
      method: methodOptions[0],
      startDate: undefined,
      endDate: undefined,
      name: "",
      points: [],
      radius: 200,
      division: 3,
      maxPlacesPerQuest: 50,
    },
  })
  const [clusters, setClusters] = useState<ClubQuestCreateDryRunResultItemDTO[]>([])

  function initializeMap(map: kakao.maps.Map) {
    kakao.maps.event.addListener(map, "click", (e: kakao.maps.event.MouseEvent) => handleClick(e.latLng))
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      undo()
    }
  }
  function undo() {
    if (form.watch("method").value === "CIRCLE") return
    if (form.watch("points").length === 0) return
    form.setValue("points", [...form.watch("points").slice(0, -1)])
  }

  function handleClick(latLng: kakao.maps.LatLng) {
    if (form.watch("method.value") === "CIRCLE") {
      form.setValue("center", { lat: latLng.getLat(), lng: latLng.getLng() })
    }
    if (form.watch("method.value") === "POLYGON") {
      form.setValue("points", [...form.getValues("points"), { lat: latLng.getLat(), lng: latLng.getLng() }])
    }
  }

  async function previewOn() {
    const isValid = await form.trigger()
    if (!isValid) return

    setPreviewLoading(true)
    try {
      const res = await previewDivisions({
        regionType: form.getValues("method").value,
        centerLocation: form.getValues("center"),
        radiusMeters: form.getValues("radius"),
        points: form.getValues("points"),
        clusterCount: form.getValues("division"),
        maxPlaceCountPerQuest: form.getValues("maxPlacesPerQuest"),
        useAlreadyCrawledPlace: form.getValues("placeSearchMethod").value === "USE_ALREADY_CRAWLED_PLACES",
        questTargetPlaceCategories: form.getValues("questTargetPlaceCategories").map((it) => it.value),
      })
      setClusters(res)
      setPreviewLoading(false)

      mode.current = "preview"
      setShowPreview(true)
    } catch (e) {
      setPreviewLoading(false)
    }
  }

  function previewOff() {
    mode.current = "draw"
    setShowPreview(false)
  }

  async function onSubmit(values: FormValues) {
    // name 값은 프리뷰 시에는 필수가 아니지만 생성할 때는 필수이므로 별도 체크 필요
    if (!values.name) {
      form.setError("name", { type: "required", message: "퀘스트 이름을 입력해주세요." })
      return
    }
    await createQuest({
      questNamePrefix: values.name,
      purposeType: values.purposeType.value,
      startAt: { value: values.startDate.getTime() },
      endAt: { value: atEndOfDay(values.endDate).getTime() },
      dryRunResults: clusters,
    })

    toast.success("퀘스트가 생성되었습니다.")
    queryClient.invalidateQueries({ queryKey: ["@quests"], exact: true })
    router.back()
  }

  return (
    <>
      <Header title="퀘스트 생성" />
      <Contents.Columns>
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={initializeMap}>
          {form.watch("method").value === "CIRCLE" && (
            <Circle center={form.watch("center")} radius={form.watch("radius")} />
          )}
          {form.watch("method").value === "POLYGON" && <Polygon forDrawing points={form.watch("points")} />}
          {showPreview &&
            clusters.map((cluster, i) =>
              cluster.targetBuildings.map((building) => (
                <ClusterMarker
                  key={building.buildingId}
                  position={building.location}
                  clusterIndex={i}
                  overlayInfo={{ title: `${cluster.questNamePostfix} ${building.name}`, places: building.places }}
                />
              )),
            )}
        </Map>
        {isPreviewLoading && <S.Loading>건물 정보를 불러오는 중입니다...</S.Loading>}
        <S.Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <fieldset>
              <Flex>
                <Combobox name="purposeType" label="퀘스트 용도" options={purposeTypeOptions} isClearable={false} />
              </Flex>
              <Flex>
                <DateInput name="startDate" label="퀘스트 시작" dateFormat="yyyy-MM-dd" />
                <DateInput name="endDate" label="퀘스트 종료" dateFormat="yyyy-MM-dd" />
              </Flex>
              <Flex>
                <Combobox
                  isMulti
                  name="questTargetPlaceCategories"
                  label="장소 카테고리"
                  placeholder=""
                  closeMenuOnSelect={false}
                  rules={{ required: { value: true, message: "1개 이상의 카테고리를 선택해주세요." } }}
                  options={questTargetPlaceCategoryOptions}
                />
              </Flex>
              <Flex>
                <Combobox
                  name="placeSearchMethod"
                  label="장소 검색 방식"
                  options={placeSearchMethodOptions}
                  isClearable={false}
                />
              </Flex>
            </fieldset>
            <fieldset disabled={showPreview}>
              <Combobox name="method" label="영역 설정 방식" options={methodOptions} isClearable={false} />
              {form.watch("method").value === "CIRCLE" && (
                <>
                  <TextInput
                    name="center.lat"
                    label="중심점 (위도)"
                    readOnly
                    rules={{ required: "지도를 클릭해 중심점을 입력해주세요." }}
                  />
                  <TextInput
                    name="center.lng"
                    label="중심점 (경도)"
                    readOnly
                    rules={{ required: "지도를 클릭해 중심점을 입력해주세요." }}
                  />
                  <NumberInput name="radius" label="반경(m)" clearable={false} />
                </>
              )}
              {form.watch("method").value === "POLYGON" && (
                <p style={{ opacity: 0.8, fontSize: "0.8em", marginBottom: 12 }}>
                  지도를 클릭해 다각형을 그리세요. <kbd>Cmd/Ctrl</kbd> + <kbd>Z</kbd>로 마지막 클릭 지점을 취소할 수 있어요.
                </p>
              )}
              <NumberInput
                name="division"
                label="조 분할"
                placeholder="화살표로 업다운이 가능해요!"
                clearable={false}
              />
              <NumberInput name="maxPlacesPerQuest" label="퀘스트 당 최대 장소 수" clearable={false} />
            </fieldset>

            <Flex direction="column" gap="8px">
              {!showPreview && (
                <S.PreviewButton type="button" onClick={previewOn}>
                  미리보기
                </S.PreviewButton>
              )}
              {showPreview && (
                <S.PreviewButton type="button" onClick={previewOff}>
                  수정하기
                </S.PreviewButton>
              )}

              {showPreview && (
                <S.PreviewSummary>
                  <tr>
                    <td colSpan={3} style={{ padding: "4px 0" }}>
                      미리보기 요약
                    </td>
                  </tr>
                  {clusters.map((cluster, i) => (
                    <tr key={i}>
                      <td>{cluster.questNamePostfix}</td>
                      <td>{cluster.targetBuildings.length}개 건물</td>
                      <td>{cluster.targetBuildings.reduce((acc, b) => acc + b.places.length, 0)}개 장소</td>
                    </tr>
                  ))}
                </S.PreviewSummary>
              )}
              {showPreview && <TextInput name="name" label="퀘스트 이름" />}
              {showPreview && <S.SubmitButton type="submit">이대로 생성하기</S.SubmitButton>}
            </Flex>
          </FormProvider>
        </S.Form>
      </Contents.Columns>
    </>
  )
}

function atEndOfDay(date: Date): Date {
  const newDate = new Date(date) // 원본 date 객체를 변경하지 않기 위해 새로운 Date 객체 생성
  newDate.setHours(23, 59, 59, 0) // 다음 날 23:59:59로 설정
  return newDate
}
