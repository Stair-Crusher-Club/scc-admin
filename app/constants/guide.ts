import buildingConquerGuide02 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide02.json"
import buildingConquerGuide03 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide03.json"
import buildingConquerGuide04 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide04.json"
import placeConquerGuide03 from "../../public/guide/register/placeConquerGuide/placeConquerGuide03.json"
import placeConquerGuide04 from "../../public/guide/register/placeConquerGuide/placeConquerGuide04.json"
import placeConquerGuide05 from "../../public/guide/register/placeConquerGuide/placeConquerGuide05.json"

type GuideSlideContentBase = {
  description: string[]
  extraDescription?: {
    title: string
    description: string[]
    descriptionStyle?: "none" | "disc"
  }
}

export type GuideSlideContent =
  | (GuideSlideContentBase & {
      sourceType: "image"
      source: string
    })
  | (GuideSlideContentBase & {
      sourceType: "lottie"
      source: object
    })

//#region 정보 등록하기
// 장소 하나 정복하기
export const singleConquerGuide: GuideSlideContent[] = [
  {
    description: ["검색창에 장소이름을 검색 후,", "검색결과에 나오는 가게를 선택해주세요."],
    source: "/guide/register/singleConquerGuide/singleConquerGuide01.png",
    sourceType: "image",
  },
  {
    description: ["검색창을 클릭하여, 검색 창으로 진입해주세요."],
    source: "/guide/register/singleConquerGuide/singleConquerGuide02.png",
    sourceType: "image",
  },
  {
    description: ["등록하기 버튼을 클릭해서", "장소 정보 등록을 시작해주세요."],
    source: "/guide/register/singleConquerGuide/singleConquerGuide03.png",
    sourceType: "image",
  },
]

// 여러 곳 정복하기
export const multipleConquerGuide: GuideSlideContent[] = [
  {
    description: ["지도 버튼을 클릭해서, 지도 화면에 진입해주세요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide01.png",
    sourceType: "image",
  },
  {
    description: ["원하는 지역으로 지도를 이동 시킨 후", "음식점/카페/편의점 등 카테고리를 선택해주세요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide02.png",
    sourceType: "image",
  },
  {
    description: ["원하는 지역으로 지도를 이동 시킨 후", "음식점/카페/편의점 등 카테고리를 선택해주세요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide03.png",
    sourceType: "image",
  },
  {
    description: ["등록하기 버튼을 클릭해서", "장소 정보 등록을 시작해주세요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide04.png",
    sourceType: "image",
  },
]

// 매장 정보 입력하기
export const placeConquerGuide: GuideSlideContent[] = [
  {
    description: ["층수를 입력해주세요."],
    source: "/guide/register/placeConquerGuide/placeConquerGuide01.png",
    sourceType: "image",
    extraDescription: {
      title: "💡 주의사항️",
      description: ["1-2층을 모두 포함해요:", "단독건물이거나, 1층을 포함해서 여러층을 사용하는 경우에 선택해주세요."],
    },
  },
  {
    description: ["사진 가이드를 참고해서,", "매장 입구 사진을 찍어주세요."],
    source: "/guide/register/placeConquerGuide/placeConquerGuide02.png",
    sourceType: "image",
    extraDescription: {
      title: "💡 주의사항️",
      description: ["매장이 1층이 아닌 경우", "해당 층에서 매장의 입구 사진을 촬영해주세요!"],
    },
  },
  {
    description: ["계단 또는 경사로 정보를 입력해주세요.", "*계단이 1칸이라면 높이도 함께 입력해요."],
    source: placeConquerGuide03,
    sourceType: "lottie",
    extraDescription: {
      title: "💡 계단 높이 정보가 필요한 이유?",
      description: ["이용자의 상황에 따라 접근 가능한 턱 높이가 다를 수 있어요."],
    },
  },
  {
    description: ["출입문 유형을 알려주세요.", "중복 선택이 가능합니다."],
    source: placeConquerGuide04,
    sourceType: "lottie",
  },
  {
    description: ["더 도움이 될 정보가 있다면,", "의견을 남겨주세요."],
    source: placeConquerGuide05,
    sourceType: "lottie",
    extraDescription: {
      title: "🍀 코멘트는 접근성을 판단하는 데 큰 도움이 돼요.",
      description: [
        "예: “이 사진은 경사로가 있는 후문 기준입니다.”",
        "“경사로가 있지만 좁고 가파른 편이라 전동휠체어 이용자는 사진을 꼭 확인해주세요.”",
      ],
      descriptionStyle: "disc",
    },
  },
]

// 건물 정보 입력하기
export const buildingConquerGuide: GuideSlideContent[] = [
  {
    description: ["건물 입구 사진을 촬영해주세요."],
    source: "/guide/register/buildingConquerGuide/buildingConquerGuide01.png",
    sourceType: "image",
    extraDescription: {
      title: "💡 건물 입구가 여러개인 경우라면?",
      description: [
        "건물 입구가 여러 개인 경우, 이동약자가 접근할 수 있는 문을 기준으로 촬영해주세요.",
        "확인이 어려운 경우에는 정문을 촬영하면 됩니다.",
        "어떤 문을 기준으로 찍었는지 의견란에 적어주시면, 큰 도움이 됩니다.",
      ],
      descriptionStyle: "disc",
    },
  },
  {
    description: ["계단 또는 경사로 정보를 입력해주세요.", "*계단이 1칸이라면 높이도 함께 입력해요."],
    source: buildingConquerGuide02,
    sourceType: "lottie",
    extraDescription: {
      title: "💡 계단 높이 정보가 필요한 이유?",
      description: ["이용자의 상황에 따라 접근 가능한 턱 높이가 다를 수 있어요."],
    },
  },
  {
    description: ["출입문 유형을 알려주세요.", "중복 선택이 가능합니다."],
    source: buildingConquerGuide03,
    sourceType: "lottie",
  },
  {
    description: ["건물 엘리베이터 정보를 입력해주세요."],
    source: buildingConquerGuide04,
    sourceType: "lottie",
    extraDescription: {
      title: "💡 엘리베이터 탑승하러 가는 길 정보도 필요해요.",
      description: [
        "엘리베이터 유무뿐 아니라, 탑승하러 가는 길의 정보도 필요해요.",
        "그 길에 계단이나 경사로가 있다면 꼭 함께 입력해주세요.",
      ],
    },
  },
  {
    description: ["더 도움이 될 정보가 있다면,", "의견을 남겨주세요."],
    source: "/guide/register/buildingConquerGuide/buildingConquerGuide05.png",
    sourceType: "image",
    extraDescription: {
      title: "🍀 코멘트는 접근성을 판단하는 데 큰 도움이 돼요.",
      description: [
        "예: “건물에 여러 입구가 있습니다. 후문 쪽이 훨씬 평평하고, 경사로도 있어서 추천해요.”",
        "“지하 주차장에서 연결되는 엘리베이터를 이용하면 편리합니다.”",
      ],
      descriptionStyle: "disc",
    },
  },
]
//#endregion
