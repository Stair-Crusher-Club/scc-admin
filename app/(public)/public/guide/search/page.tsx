import GuideLayout from "@/components/Guide/GuideLayout"
import GuideSlider from "@/components/Guide/GuideSlider/GuideSlider"
import * as S from "@/components/Guide/GuideSlider/GuideSliderItem.style"
import GuideTypography from "@/components/Guide/GuideTypography"
import { filterSearchGuide, locationSearchGuide, placeSearchGuide, sccRoadGuide } from "@/constants/guide"

export default function SearchGuidePage() {
  return (
    <GuideLayout active="search">
      <section
        style={{
          padding: "40px 0 80px",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <GuideTypography variant="title" css={{ marginBottom: 12 }}>
            지도에서 접근 정보 확인하기
          </GuideTypography>
          <GuideTypography variant="description" css={{ marginBottom: 12 }}>
            계단뿌셔클럽 앱에서는 [접근레벨] 기능을 통해 장소의 접근성을 지도에서 쉽게 확인할 수 있어요.
          </GuideTypography>
          <div style={{ marginBottom: 32 }}>
            <S.ExtraDescriptionSection>
              <S.ExtraDescriptionTitle>마커 컬러별 의미 🚥</S.ExtraDescriptionTitle>
              <ul>
                {[
                  "초록색: 접근이 쉬움(계단 없거나 경사로 있음)",
                  "노란색: 계단이 1칸 이상 있음",
                  "빨간색: 계단이 5칸 이상이거나 엘리베이터 없음",
                ].map((desc, idx) => (
                  <S.ExtraDescriptionItem key={`$scc-road-desc-${idx}`} hasStyle={true}>
                    <S.ExtraDescriptionDot />
                    <S.ExtraDescription>{desc}</S.ExtraDescription>
                  </S.ExtraDescriptionItem>
                ))}
              </ul>
            </S.ExtraDescriptionSection>
          </div>

          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            지도로 위치 기반 탐색하기
          </GuideTypography>
          <GuideTypography variant="description">
            지도 화면으로 바로 진입해 원하는 카테고리를 검색하면 접근성 정보를 빠르게 확인할 수 있어요.
          </GuideTypography>
        </div>
        <GuideSlider items={locationSearchGuide} name="locationSearchGuide" />

        <div style={{ padding: "0 20px", marginTop: 48, marginBottom: 20 }}>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            장소 이름으로 검색하기
          </GuideTypography>
          <GuideTypography variant="description">
            검색창에 장소이름을 검색해 빠르게 정보를 확인할 수 있어요.
          </GuideTypography>
        </div>
        <GuideSlider items={placeSearchGuide} name="placeSearchGuide" />

        <div style={{ padding: "0 20px", marginTop: 48, marginBottom: 20 }}>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            조건별로 장소 찾기
          </GuideTypography>
          <GuideTypography variant="description">
            검색 필터를 활용하면, 조건에 맞는 장소만 골라서 확인할 수 있어요.
          </GuideTypography>
        </div>
        <GuideSlider items={filterSearchGuide} name="filterSearchGuide" />
      </section>

      <section
        style={{
          padding: "40px 0 80px",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <GuideTypography variant="title" css={{ marginBottom: 12 }}>
            뿌클로드로 장소 후기 확인하기
          </GuideTypography>
          <GuideTypography variant="description" css={{ marginBottom: 32 }}>
            뿌클로드는 이동약자와 친구들이 직접 남긴 장소 리뷰예요. 매장 내부부터 주차장, 화장실까지 생생한 접근 정보를
            확인할 수 있어요.
          </GuideTypography>
          <GuideTypography variant="subtitle" css={{ marginBottom: 8 }}>
            앱에서 뿌클로드 조회하기
          </GuideTypography>
          <GuideTypography variant="description">
            <strong>앱 메뉴에서 뿌클로드에 들어가면</strong>
          </GuideTypography>
          <GuideTypography variant="description">
            접근 정보, 장소별 리뷰, 특별기획 콘텐츠를 볼 수 있어요.
          </GuideTypography>
        </div>
        <GuideSlider items={sccRoadGuide} name="sccRoadGuide" />
      </section>
    </GuideLayout>
  )
}
