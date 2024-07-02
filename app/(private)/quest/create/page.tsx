"use client"

import { Combobox, NumberInput, TextInput } from "@reactleaf/input/hookform"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { ClusterPreview, createQuest, previewDivisions } from "@/lib/apis/api"

import Map from "@/components/Map"
import { Circle, Polygon } from "@/components/Map/components"
import { Contents, Header } from "@/components/layout"
import { Flex } from "@/styles/jsx"

import * as S from "./page.style"

const methodOptions = [
  { label: "지점 - 반경", value: "center" },
  { label: "다각형 그리기", value: "polygon" },
]

interface FormValues {
  name: string
  method: (typeof methodOptions)[number]
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
  const [previewChecked, setPreviewChecked] = useState(false)
  const [isPreviewLoading, setPreviewLoading] = useState(false)
  const mapRef = useRef<kakao.maps.Map>()
  const form = useForm<FormValues>({
    defaultValues: {
      method: methodOptions[0],
      name: "",
      points: [],
      radius: 200,
      division: 3,
      maxPlacesPerQuest: 50,
    },
  })
  const previewMarkers = useRef<kakao.maps.Marker[]>([])
  const clusters = useRef<ClusterPreview[]>([])

  function initializeMap(map: kakao.maps.Map) {
    kakao.maps.event.addListener(map, "click", (e: kakao.maps.event.MouseEvent) => handleClick(e.latLng))
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === "z") {
      undo()
    }
  }
  function undo() {
    if (form.watch("method").value === "center") return
    if (form.watch("points").length === 0) return
    form.setValue("points", [...form.watch("points").slice(0, -1)])
  }

  function handleClick(latLng: kakao.maps.LatLng) {
    if (form.watch("method.value") === "center") {
      form.setValue("center", { lat: latLng.getLat(), lng: latLng.getLng() })
    }
    if (form.watch("method.value") === "polygon") {
      form.setValue("points", [...form.getValues("points"), { lat: latLng.getLat(), lng: latLng.getLng() }])
    }
  }

  async function previewOn() {
    const isValid = await form.trigger()
    if (!isValid) return

    setPreviewLoading(true)
    const res = await previewDivisions({
      centerLocation: form.getValues("center"),
      radiusMeters: form.getValues("radius"),
      clusterCount: form.getValues("division"),
      maxPlaceCountPerQuest: form.getValues("maxPlacesPerQuest"),
    })
    setPreviewLoading(false)

    mode.current = "preview"
    clusters.current = (await res.json()) as ClusterPreview[]

    clusters.current.forEach((cluster, i) => {
      cluster.targetBuildings.forEach((building) => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(building.location.lat, building.location.lng),
          image: new kakao.maps.MarkerImage("/marker_cluster_sprite.png", new kakao.maps.Size(24, 36), {
            offset: new kakao.maps.Point(12, 36),
            spriteOrigin: new kakao.maps.Point(24 * (i % 10), 36 * Math.floor(i / 10)),
            spriteSize: new kakao.maps.Size(24 * 10, 36 * 4),
          }),
        })
        marker.setMap(mapRef.current!)

        // 마커에 커서가 오버됐을 인포윈도우로 건물정보 / 장소목록을 노출합니다.
        const iwContent = `<div style="padding:5px;">
          <b>${cluster.questNamePostfix} ${building.name}</b> <small>(${building.places.length}개 장소)</small>
          <br />
          <p style="white-space:pre;">${building.places.map((p) => p.name).join("\n")}</p>
        </div>`

        const infowindow = new kakao.maps.InfoWindow({ content: iwContent })
        kakao.maps.event.addListener(marker, "mouseover", () => infowindow.open(mapRef.current!, marker))
        kakao.maps.event.addListener(marker, "mouseout", () => infowindow.close())

        previewMarkers.current.push(marker)
      })
    })
    setPreviewChecked(true)
  }

  function previewOff() {
    mode.current = "draw"
    previewMarkers.current.forEach((m) => m.setMap(null))
    setPreviewChecked(false)
  }

  async function onSubmit(values: FormValues) {
    // name 값은 프리뷰 시에는 필수가 아니지만 생성할 때는 필수이므로 별도 체크 필요
    if (!values.name) {
      form.setError("name", { type: "required", message: "퀘스트 이름을 입력해주세요." })
      return
    }
    await createQuest({ questNamePrefix: values.name, dryRunResults: clusters.current })

    toast.success("퀘스트가 생성되었습니다.")
    queryClient.invalidateQueries({ queryKey: ["@quests"], exact: true })
    router.back()
  }

  return (
    <>
      <Header title="퀘스트 생성" />
      <Contents.Columns>
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={initializeMap}>
          {form.watch("method").value === "center" && (
            <Circle center={form.watch("center")} radius={form.watch("radius")} />
          )}
          {form.watch("method").value === "polygon" && <Polygon points={form.watch("points")} />}
        </Map>
        {isPreviewLoading && <S.Loading>건물 정보를 불러오는 중입니다...</S.Loading>}
        <S.Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <fieldset disabled={previewChecked}>
              <Combobox name="method" label="영역 설정 방식" options={methodOptions} />
              {form.watch("method").value === "center" && (
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
              <NumberInput
                name="division"
                label="조 분할"
                placeholder="화살표로 업다운이 가능해요!"
                clearable={false}
              />
              <NumberInput name="maxPlacesPerQuest" label="퀘스트 당 최대 장소 수" clearable={false} />
            </fieldset>

            <Flex direction="column" gap="8px">
              {!previewChecked && (
                <S.PreviewButton type="button" onClick={previewOn}>
                  미리보기
                </S.PreviewButton>
              )}
              {previewChecked && (
                <S.PreviewButton type="button" onClick={previewOff}>
                  수정하기
                </S.PreviewButton>
              )}

              {previewChecked && (
                <S.PreviewSummary>
                  <tr>
                    <td colSpan={3} style={{ padding: "4px 0" }}>
                      미리보기 요약
                    </td>
                  </tr>
                  {clusters.current.map((cluster, i) => (
                    <tr key={i}>
                      <td>{cluster.questNamePostfix}</td>
                      <td>{cluster.targetBuildings.length}개 건물</td>
                      <td>{cluster.targetBuildings.reduce((acc, b) => acc + b.places.length, 0)}개 장소</td>
                    </tr>
                  ))}
                </S.PreviewSummary>
              )}
              {previewChecked && <TextInput name="name" label="퀘스트 이름" />}
              {previewChecked && <S.SubmitButton type="submit">이대로 생성하기</S.SubmitButton>}
            </Flex>
          </FormProvider>
        </S.Form>
      </Contents.Columns>
    </>
  )
}
