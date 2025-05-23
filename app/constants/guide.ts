import buildingConquerGuide02 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide02.json"
import buildingConquerGuide03 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide03.json"
import buildingConquerGuide04 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide04.json"
import buildingConquerGuide05 from "../../public/guide/register/buildingConquerGuide/buildingConquerGuide05.json"
import placeConquerGuide03 from "../../public/guide/register/placeConquerGuide/placeConquerGuide03.json"
import placeConquerGuide04 from "../../public/guide/register/placeConquerGuide/placeConquerGuide04.json"
import placeConquerGuide05 from "../../public/guide/register/placeConquerGuide/placeConquerGuide05.json"
import filterSearchGuide03 from "../../public/guide/search/filterSearchGuide/filterSearchGuide03.json"
import filterSearchGuide04 from "../../public/guide/search/filterSearchGuide/filterSearchGuide04.json"
import filterSearchGuide05 from "../../public/guide/search/filterSearchGuide/filterSearchGuide05.json"
import sccRoadGuide04 from "../../public/guide/search/sccRoadGuide/sccRoadGuide04.json"

type GuideSlideContentBase = {
  title?: string
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
    description: ["검색창을 눌러, ", "정복하고 싶은 장소를 찾아보세요."],
    source: "/guide/register/singleConquerGuide/singleConquerGuide01.png",
    sourceType: "image",
  },
  {
    description: ["장소 이름을 입력하고,", "검색 결과에서 해당 장소를 선택해요."],
    source: "/guide/register/singleConquerGuide/singleConquerGuide02.png",
    sourceType: "image",
  },
  {
    description: ["<strong>[등록하기]</strong> 버튼을 눌러", "정보 등록을 시작해요."],
    source: "/guide/register/singleConquerGuide/singleConquerGuide03.png",
    sourceType: "image",
  },
]

// 여러 곳 정복하기
export const multipleConquerGuide: GuideSlideContent[] = [
  {
    description: ["<strong>[지도]</strong> 아이콘을 눌러,", "지도 화면으로 이동해요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide01.png",
    sourceType: "image",
  },
  {
    description: ["지도를 원하는 지역으로 옮기고,", "음식점·카페·편의점 등 카테고리를 선택해요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide02.png",
    sourceType: "image",
  },
  {
    description: ["<strong>[정복 여부]</strong> 필터에서", "'정복 안된 곳만 보기'를 선택해요."],
    source: "/guide/register/multipleConquerGuide/multipleConquerGuide03.png",
    sourceType: "image",
  },
  {
    description: ["정복하고 싶은 장소를 골라,", "<strong>[등록하기]</strong> 버튼을 눌러 등록을 시작해요."],
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
      title: "💡주의사항️",
      description: ["1-2층을 모두 포함해요:", "단독건물이거나, 1층을 포함해서 여러층을 사용하는 경우에 선택해주세요."],
    },
  },
  {
    description: ["사진 가이드를 참고해서,", "매장 입구 사진을 찍어주세요."],
    source: "/guide/register/placeConquerGuide/placeConquerGuide02.png",
    sourceType: "image",
    extraDescription: {
      title: "💡주의사항️",
      description: ["매장이 1층이 아닌 경우", "해당 층에서 <strong>매장의 입구 사진</strong>을 촬영해주세요!"],
    },
  },
  {
    description: ["계단 또는 경사로 정보를 입력해주세요.", "*계단이 1칸이라면 높이도 함께 입력해요."],
    source: placeConquerGuide03,
    sourceType: "lottie",
    extraDescription: {
      title: "💡계단 높이 정보가 필요한 이유?",
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
      title: "💡코멘트는 접근성을 판단하는 데 큰 도움이 돼요. (예시)",
      description: [
        "이 사진은 경사로가 있는 후문 기준입니다.",
        "경사로가 있지만 좁고 가파른 편이라 전동휠체어 이용자는 사진을 꼭 확인해주세요.",
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
      title: "💡건물 입구가 여러개인 경우라면?",
      description: [
        "이동약자가 접근할 수 있는 문을 기준으로 촬영해주세요.",
        "확인이 어려운 경우에는 정문을 촬영하면 됩니다.",
        "<strong>어떤 문을 기준으로 찍었는지 의견란에 적어주시면,</strong> 큰 도움이 됩니다.",
      ],
      descriptionStyle: "disc",
    },
  },
  {
    description: ["계단 또는 경사로 정보를 입력해주세요.", "*계단이 1칸이라면 높이도 함께 입력해요."],
    source: buildingConquerGuide02,
    sourceType: "lottie",
    extraDescription: {
      title: "💡계단 높이 정보가 필요한 이유?",
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
      title: "💡엘리베이터 탑승하러 가는 길 정보도 필요해요.",
      description: [
        "엘리베이터 유무뿐 아니라, ",
        "탑승하러 가는 길의 정보도 필요해요.",
        "그 길에 <strong>계단이나 경사로가 있다면</strong> 꼭 함께 입력해주세요.",
      ],
    },
  },
  {
    description: ["더 도움이 될 정보가 있다면,", "의견을 남겨주세요."],
    source: buildingConquerGuide05,
    sourceType: "lottie",
    extraDescription: {
      title: "💡코멘트는 접근성을 판단하는 데 큰 도움이 돼요. (예시)",
      description: [
        "건물에 여러 입구가 있습니다. 후문 쪽이 훨씬 평평하고, 경사로도 있어서 추천해요.",
        "지하 주차장에서 연결되는 엘리베이터를 이용하면 편리합니다.",
      ],
      descriptionStyle: "disc",
    },
  },
]
//#endregion

//#region 정보 조회하기
export const locationSearchGuide: GuideSlideContent[] = [
  {
    description: ["지도 아이콘을 눌러,", "지도 화면으로 이동해요."],
    source: "/guide/search/locationSearchGuide/locationSearchGuide01.png",
    sourceType: "image",
  },
  {
    description: ["지도를 원하는 지역으로 옮기고,", "음식점·카페·편의점 등 카테고리를 선택해요."],
    source: "/guide/search/locationSearchGuide/locationSearchGuide02.png",
    sourceType: "image",
  },
  {
    description: ["지도의 마커를 통해", "한눈에 접근성을 확인할 수 있어요."],
    source: "/guide/search/locationSearchGuide/locationSearchGuide03.png",
    sourceType: "image",
  },
  {
    description: ["장소 상세페이지에 들어가면", "사진과 함께 자세한 접근성 정보를 볼 수 있어요."],
    source: "/guide/search/locationSearchGuide/locationSearchGuide04.png",
    sourceType: "image",
  },
]

export const placeSearchGuide: GuideSlideContent[] = [
  {
    description: ["검색창을 눌러, 검색 화면으로 들어가세요."],
    source: "/guide/search/placeSearchGuide/placeSearchGuide01.png",
    sourceType: "image",
  },
  {
    description: ["장소 이름을 입력하고,", "검색 결과에서 원하는 매장을 선택하세요."],
    source: "/guide/search/placeSearchGuide/placeSearchGuide02.png",
    sourceType: "image",
  },
  {
    description: ["장소 상세페이지에서 사진과 함께 접근성 정보를 확인할 수 있어요."],
    source: "/guide/search/placeSearchGuide/placeSearchGuide03.png",
    sourceType: "image",
  },
]

export const filterSearchGuide: GuideSlideContent[] = [
  {
    description: ["카테고리나 장소를 검색해", "지도 화면으로 이동해주세요."],
    source: "/guide/search/filterSearchGuide/filterSearchGuide01.png",
    sourceType: "image",
  },
  {
    description: ["상단의 검색 필터를 사용해", "조건에 맞는 장소만 골라볼 수 있어요."],
    source: "/guide/search/filterSearchGuide/filterSearchGuide02.png",
    sourceType: "image",
  },
  {
    title: "접근 레벨",
    description: ["접근 레벨에 따라", "원하는 수준만 골라볼 수 있어요."],
    source: filterSearchGuide03,
    sourceType: "lottie",
  },
  {
    title: "경사로 유무",
    description: ["접근레벨 0이거나,", "경사로가 있는 곳만 모아볼 수 있어요."],
    source: filterSearchGuide04,
    sourceType: "lottie",
  },
  {
    title: "정복 유무",
    description: ["정보가 등록된 곳만", "따로 모아서 볼 수 있어요."],
    source: filterSearchGuide05,
    sourceType: "lottie",
  },
]

export const sccRoadGuide: GuideSlideContent[] = [
  {
    description: ["앱 하단에서 ‘메뉴' 탭을 클릭해요."],
    source: "/guide/search/sccRoadGuide/sccRoadGuide01.png",
    sourceType: "image",
  },
  {
    description: ["<strong>[뿌클로드: 이동약자를 위한 진짜 리뷰]</strong>", "항목을 선택해요."],
    source: "/guide/search/sccRoadGuide/sccRoadGuide02.png",
    sourceType: "image",
  },
  {
    description: ["이동약자와 친구로 구성된 에디터가 직접 다녀온 카페, 식당, 관광지 후기를 모아볼 수 있어요."],
    source: "/guide/search/sccRoadGuide/sccRoadGuide03.png",
    sourceType: "image",
  },
  {
    description: ["휠체어 유형, 화장실 유무 등", "장소 방문 전 꼭 필요한 정보를 확인해보세요."],
    source: sccRoadGuide04,
    sourceType: "lottie",
  },
]
//#endregion
