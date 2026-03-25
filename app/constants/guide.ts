export type GuideSlideContent = {
  sourceType: "image"
  source: string
  title?: string
  description: string[]
  extraDescription?: {
    title: string
    description: string[]
    descriptionStyle?: "none" | "disc"
  }
  imageObjectFit?: "cover" | "contain"
}

//#region 정보 등록하기
// 내 근처 정복 안 된 장소만 모아보기
export const nearbyConquerGuide: GuideSlideContent[] = [
  {
    description: ["<strong>[등록하기]</strong> 버튼을 눌러,", "지도 화면으로 이동해요."],
    source: "/guide/register/nearbyConquerGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["내 근처 정복 안 된 장소들을", "확인해요."],
    source: "/guide/register/nearbyConquerGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["정복하고 싶은 장소를 골라,", "<strong>[등록하기]</strong> 버튼을 눌러 등록을 시작해요."],
    source: "/guide/register/nearbyConquerGuide/03.png",
    sourceType: "image",
  },
]

// 장소 하나 정복하기
export const singleConquerGuide: GuideSlideContent[] = [
  {
    description: ["검색창을 눌러,", "정복하고 싶은 장소를 찾아보세요."],
    source: "/guide/register/singleConquerGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["장소 이름을 입력하고,", "검색 결과에서 해당 장소를 선택해요."],
    source: "/guide/register/singleConquerGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["<strong>[등록하기]</strong> 버튼을 눌러,", "정보 등록을 시작해요."],
    source: "/guide/register/singleConquerGuide/03.png",
    sourceType: "image",
  },
]

// 여러 곳 정복하기
export const multipleConquerGuide: GuideSlideContent[] = [
  {
    description: ["<strong>[지도]</strong> 아이콘을 눌러,", "지도 화면으로 이동해요."],
    source: "/guide/register/multipleConquerGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["지도를 원하는 지역으로 옮기고,", "음식점·카페·편의점 등 카테고리를 선택해요."],
    source: "/guide/register/multipleConquerGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["<strong>[정복 여부]</strong> 필터에서", "'정복 안 된 곳만 보기'를 선택해요."],
    source: "/guide/register/multipleConquerGuide/03.png",
    sourceType: "image",
  },
  {
    description: ["정복하고 싶은 장소를 골라,", "<strong>[등록하기]</strong> 버튼을 눌러 등록을 시작해요."],
    source: "/guide/register/multipleConquerGuide/04.png",
    sourceType: "image",
  },
]

// 매장 정보 입력하기
export const placeConquerGuide: GuideSlideContent[] = [
  {
    description: ["층 정보를 입력해주세요."],
    source: "/guide/register/placeConquerGuide/01.png",
    sourceType: "image",
    extraDescription: {
      title: "💡주의사항️",
      description: [
        "1층을 포함한 여러층이에요:",
        "한 건물에서 1층을 포함해서 여러층을 사용하는 경우에 선택해주세요.",
      ],
    },
  },
  {
    description: ["사진 가이드를 참고해서,", "매장 입구 사진을 찍어주세요."],
    source: "/guide/register/placeConquerGuide/02.png",
    sourceType: "image",
    imageObjectFit: "cover",
    extraDescription: {
      title: "💡주의사항",
      description: ["매장이 1층이 아닌 경우", "해당 층에서 <strong>매장의 입구 사진</strong>을 촬영해주세요!"],
    },
  },
  {
    description: ["계단 또는 경사로 정보를 입력해주세요.", "*계단이 1칸이라면 계단의 높이도 함께 입력해요."],
    source: "/guide/register/placeConquerGuide/03.png",
    sourceType: "image",
    extraDescription: {
      title: "💡계단 높이 정보가 필요한 이유?",
      description: ["이용자의 상황에 따라 접근 가능한 턱 높이가 다를 수 있어요."],
    },
  },
  {
    description: ["출입문 유형을 알려주세요.", "중복 선택이 가능합니다."],
    source: "/guide/register/placeConquerGuide/04.png",
    sourceType: "image",
  },
  {
    description: ["더 도움이 될 정보가 있다면,", "의견을 남겨주세요."],
    source: "/guide/register/placeConquerGuide/05.png",
    sourceType: "image",
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
    description: ["출입구 위치를 선택한 후,", "해당 입구의 사진을 촬영해 주세요."],
    source: "/guide/register/buildingConquerGuide/01.png",
    sourceType: "image",
    extraDescription: {
      title: "💡주의사항",
      description: [
        "가능한 접근성 좋은 출입구를 입력해주세요.",
        "그 외 출입문을 선택한 경우에는 어떤 문을 기준으로 찍었는지(Gate 8, 지하 주차장 2층 상가방향) 알려주세요.",
      ],
    },
  },
  {
    description: ["계단 또는 경사로 정보를 입력해주세요.", "*계단이 1칸이라면 계단의 높이도 함께 입력해요."],
    source: "/guide/register/buildingConquerGuide/02.png",
    sourceType: "image",
    extraDescription: {
      title: "💡계단 높이 정보가 필요한 이유?",
      description: ["이용자의 상황에 따라 접근 가능한 턱 높이가 다를 수 있어요."],
    },
  },
  {
    description: ["출입문 유형을 알려주세요.", "중복 선택이 가능합니다."],
    source: "/guide/register/buildingConquerGuide/03.png",
    sourceType: "image",
  },
  {
    description: ["건물 엘리베이터 정보를 입력해주세요."],
    source: "/guide/register/buildingConquerGuide/04.png",
    sourceType: "image",
    extraDescription: {
      title: "💡엘리베이터 탑승하러 가는 길 정보도 필요해요.",
      description: [
        "엘리베이터 유무뿐 아니라,",
        "탑승하러 가는 길의 정보도 필요해요.",
        "그 길에 <strong>계단이나 경사로가 있다면</strong> 꼭 함께 입력해주세요.",
      ],
    },
  },
  {
    description: ["더 도움이 될 정보가 있다면,", "의견을 남겨주세요."],
    source: "/guide/register/buildingConquerGuide/05.png",
    sourceType: "image",
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
// 조회하기로 내 근처 장소 한 번에 탐색하기
export const nearbySearchGuide: GuideSlideContent[] = [
  {
    description: ["<strong>[조회하기]</strong> 버튼을 눌러,", "지도 화면으로 이동해요."],
    source: "/guide/search/nearbySearchGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["내 근처 정복이 완료된 장소들만", "접근성 기준으로 확인해요."],
    source: "/guide/search/nearbySearchGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["장소 상세페이지에 들어가면", "사진과 함께 자세한 접근성 정보를 볼 수 있어요."],
    source: "/guide/search/nearbySearchGuide/03.png",
    sourceType: "image",
  },
]

export const locationSearchGuide: GuideSlideContent[] = [
  {
    description: ["지도 아이콘을 클릭해서,", "지도 화면으로 진입해주세요."],
    source: "/guide/search/locationSearchGuide/01.png",
    sourceType: "image",
    extraDescription: {
      title: "💡내 주변 장소를 확인하고 싶다면?️",
      description: ["홈 화면에서 음식점, 카페, 편의점 등 카테고리를", "바로 선택해주세요."],
    },
  },
  {
    description: ["원하는 지역으로 지도를 이동 시킨 후", "음식점/카페/편의점 등 카테고리를 선택해주세요."],
    source: "/guide/search/locationSearchGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["지도의 마커를 통해", "한눈에 접근성을 확인할 수 있어요."],
    source: "/guide/search/locationSearchGuide/03.png",
    sourceType: "image",
  },
  {
    description: ["장소 상세페이지에 들어가면", "사진과 함께 자세한 접근성 정보를 볼 수 있어요."],
    source: "/guide/search/locationSearchGuide/04.png",
    sourceType: "image",
  },
]

export const placeSearchGuide: GuideSlideContent[] = [
  {
    description: ["검색창을 눌러, 검색 화면으로 들어가세요."],
    source: "/guide/search/placeSearchGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["장소 이름을 입력하고,", "검색 결과에서 원하는 매장을 선택하세요."],
    source: "/guide/search/placeSearchGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["장소 상세페이지에서", "사진과 함께 접근성 정보를 확인할 수 있어요."],
    source: "/guide/search/placeSearchGuide/03.png",
    sourceType: "image",
  },
]

export const filterSearchGuide: GuideSlideContent[] = [
  {
    description: ["카테고리나 장소를 검색해", "지도 화면으로 이동해주세요."],
    source: "/guide/search/filterSearchGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["상단의 검색 필터를 사용해", "조건에 맞는 장소만 골라볼 수 있어요."],
    source: "/guide/search/filterSearchGuide/02.png",
    sourceType: "image",
  },
  {
    title: "접근 레벨",
    description: ["접근 레벨에 따라", "원하는 수준만 골라볼 수 있어요."],
    source: "/guide/search/filterSearchGuide/03.png",
    sourceType: "image",
  },
  {
    title: "경사로 유무",
    description: ["접근레벨 0이거나,", "경사로가 있는 곳만 모아볼 수 있어요."],
    source: "/guide/search/filterSearchGuide/04.png",
    sourceType: "image",
  },
  {
    title: "정복 여부",
    description: ["정보가 등록된 곳만", "따로 모아서 볼 수 있어요."],
    source: "/guide/search/filterSearchGuide/05.png",
    sourceType: "image",
  },
]

export const sccRoadGuide: GuideSlideContent[] = [
  {
    description: ["앱 하단에서 '메뉴' 탭을 클릭해요."],
    source: "/guide/search/sccRoadGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["<strong>[뿌클로드: 이동약자를 위한 진짜 리뷰]</strong>", "항목을 선택해요."],
    source: "/guide/search/sccRoadGuide/02.png",
    sourceType: "image",
  },
  {
    description: ["이동약자와 친구로 구성된 에디터가 직접 다녀온", "카페, 식당, 관광지 후기를 모아볼 수 있어요."],
    source: "/guide/search/sccRoadGuide/03.png",
    sourceType: "image",
  },
  {
    description: ["휠체어 유형, 화장실 유무 등", "장소 방문 전 꼭 필요한 정보를 확인해보세요."],
    source: "/guide/search/sccRoadGuide/04.png",
    sourceType: "image",
  },
]

// 주제별로 뿌클로드 조회하기
export const sccRoadTopicGuide: GuideSlideContent[] = [
  {
    description: ["홈화면 하단에서 '이런 키워드는 어때요?'", "영역의 원하는 컨텐츠를 클릭해요."],
    source: "/guide/search/sccRoadTopicGuide/01.png",
    sourceType: "image",
  },
  {
    description: ["야구장, 콘서트장의 휠체어석 시야 사진과", "동선 정보, 후기를 모아볼 수 있어요."],
    source: "/guide/search/sccRoadTopicGuide/02.png",
    sourceType: "image",
  },
]
//#endregion
