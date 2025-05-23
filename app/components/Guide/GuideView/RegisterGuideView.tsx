import GuideSlider from "@/components/Guide/GuideSlider/GuideSlider"
import GuideTypography from "@/components/Guide/GuideTypography"
import { buildingConquerGuide, multipleConquerGuide, placeConquerGuide, singleConquerGuide } from "@/constants/guide"

export default function RegisterGuideView() {
  return (
    <>
      <section
        style={{
          padding: "40px 0 80px",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <GuideTypography variant="title" css={{ marginBottom: 20 }}>
            1. 장소 검색하기
          </GuideTypography>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            장소 하나 정복하기
          </GuideTypography>
          <GuideTypography variant="description">정복(등록)하고 싶은 장소가 있다면,</GuideTypography>
          <GuideTypography variant="description">검색창에 입력해서 바로 등록을 시작해요.</GuideTypography>
        </div>

        <GuideSlider items={singleConquerGuide} name="singleConquerGuide" />

        <div style={{ padding: "0 20px", marginTop: 48, marginBottom: 20 }}>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            여러 곳 정복하기
          </GuideTypography>
          <GuideTypography variant="description">
            [정복 안된 곳만 보기] 필터로 내 근처 미정복 장소를 찾아,
          </GuideTypography>
          <GuideTypography variant="description">한 번에 여러 곳을 쉽게 정복할 수 있어요!</GuideTypography>
        </div>

        <GuideSlider items={multipleConquerGuide} name="multipleConquerGuide" />
      </section>

      <section
        style={{
          padding: "40px 0 80px",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <GuideTypography variant="title" css={{ marginBottom: 20 }}>
            2. 계단정보 등록하기
          </GuideTypography>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            매장 정보 입력하기
          </GuideTypography>
          <GuideTypography variant="description">층수, 출입구 사진, 계단 정보 순서로 입력해요.</GuideTypography>
          <GuideTypography variant="description">정확한 사진을 등록할수록,</GuideTypography>
          <GuideTypography variant="description">다른 사람들에게 더 큰 도움이 됩니다.</GuideTypography>
        </div>

        <GuideSlider items={placeConquerGuide} name="placeConquerGuide" />

        <div style={{ padding: "0 20px", marginTop: 48, marginBottom: 20 }}>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            건물 정보 입력하기
          </GuideTypography>
          <GuideTypography variant="description">
            매장 정보를 다 입력했다면, 꼭 <strong>건물 정보</strong>도 함께 등록해주세요.
          </GuideTypography>
          <GuideTypography variant="description">건물 정보가 없으면 전체적인 접근성 정보를</GuideTypography>
          <GuideTypography variant="description">정확히 전달할 수 없어요.</GuideTypography>
        </div>

        <GuideSlider items={buildingConquerGuide} name="buildingConquerGuide" />
      </section>
    </>
  )
}
