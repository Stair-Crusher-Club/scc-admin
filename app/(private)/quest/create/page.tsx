"use client"

import { NumberInput, TextInput } from "@reactleaf/input/hookform"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { previewDivisions } from "@/lib/apis/api"
import { QuestBuilding } from "@/lib/models/quest"

import { Flex } from "@/styles/jsx"

import * as S from "./page.style"

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

interface FormValues {
  name: string
  center: { lat: number; lng: number }
  radius: number
  division: number
  maxPlacesPerQuest: number
}

interface ClusterPreview {
  questNamePostfix: string
  targetBuildings: QuestBuilding[]
}

export default function QuestCreate() {
  const router = useRouter()
  // 센터 모드 : 중심점 설정 모드
  // 프리뷰 모드 : 조 분할 미리보기 모드
  const mode = useRef<"center" | "preview">("center")
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [previewChecked, setPreviewChecked] = useState(false)
  const [isPreviewLoading, setPreviewLoading] = useState(false)
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map>()
  const marker = useRef<kakao.maps.Marker>()
  const circle = useRef<kakao.maps.Circle>()
  const form = useForm<FormValues>({
    defaultValues: { name: "", radius: 200, division: 3, maxPlacesPerQuest: 50 },
  })
  const previewMarkers = useRef<kakao.maps.Marker[]>([])

  useEffect(() => {
    if (!scriptLoaded) return
    kakao.maps.load(() => {
      initializeMap()
    })
  }, [scriptLoaded])

  const radius = form.watch("radius")
  useEffect(() => {
    if (!radius) return
    circle.current?.setRadius(radius)
  }, [radius])

  function initializeMap() {
    const mapContainer = document.getElementById("map")!
    const map = (mapRef.current = new kakao.maps.Map(mapContainer, {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
    }))

    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.LEFT)

    // 보이지 않는 곳에 마커를 생성합니다.
    marker.current = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(0, 0),
      image: new kakao.maps.MarkerImage("/marker_center.jpg", new kakao.maps.Size(20, 20), {
        offset: new kakao.maps.Point(10, 10),
      }),
    })
    marker.current.setMap(map)

    // 지도에 표시할 원을 생성합니다
    circle.current = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(0, 0), // 원의 중심좌표 입니다
      radius: 200, // 미터 단위의 원의 반지름입니다
      strokeWeight: 5, // 선의 두께입니다
      strokeColor: "#75B8FA", // 선의 색깔입니다
      strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
      strokeStyle: "solid", // 선의 스타일 입니다
      fillColor: "#CFE7FF", // 채우기 색깔입니다
      fillOpacity: 0.1, // 채우기 불투명도 입니다
    })
    circle.current.setMap(map)

    kakao.maps.event.addListener(map, "click", function (e: kakao.maps.event.MouseEvent) {
      handleClick(e.latLng)
    })
  }

  function handleClick(latlng: kakao.maps.LatLng) {
    if (mode.current !== "center") return
    marker.current?.setPosition(latlng)
    circle.current?.setPosition(latlng)

    form.setValue("center", { lat: latlng.getLat(), lng: latlng.getLng() })
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
    const clusters = (await res.json()) as ClusterPreview[]
    clusters.forEach((cluster, i) => {
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
    mode.current = "center"
    previewMarkers.current.forEach((m) => m.setMap(null))
    setPreviewChecked(false)
  }

  function onSubmit(values: FormValues) {
    // name 값은 프리뷰 시에는 필수가 아니지만 생성할 때는 필수이므로 별도 체크 필요
    if (!values.name) {
      form.setError("name", { type: "required", message: "퀘스트 이름을 입력해주세요." })
      return
    }
    alert("컨펌 후 생성하기")
    console.log(values)
  }

  return (
    <S.Page>
      <S.Header>퀘스트 생성</S.Header>
      <S.Body>
        <Script
          id="kakao-map-script"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
          onReady={() => setScriptLoaded(true)}
          onError={(e) => alert(`지도를 불러올 수 없습니다.`)}
        />
        <S.Map id="map" ref={mapElement} />
        {!scriptLoaded && <S.Loading>지도를 불러오는 중입니다...</S.Loading>}
        {isPreviewLoading && <S.Loading>건물 정보를 불러오는 중입니다...</S.Loading>}
        <S.Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <fieldset disabled={previewChecked}>
              <TextInput name="name" label="퀘스트 이름" />
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
              <NumberInput
                name="division"
                label="조 분할"
                placeholder="화살표로 업다운이 가능해요!"
                clearable={false}
              />
              <NumberInput name="maxPlacesPerQuest" label="퀘스트 당 최대 장소 수" clearable={false} />
            </fieldset>
          </FormProvider>
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
            {previewChecked && <S.SubmitButton type="submit">이대로 생성하기</S.SubmitButton>}
          </Flex>
        </S.Form>
      </S.Body>
    </S.Page>
  )
}
