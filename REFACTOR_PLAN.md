# 뿌클로드 페이지 구성 변경 계획 (Admin + App API)

## 📋 변경 사항 요약

### 1. Admin API 스펙 변경 (`subprojects/scc-api/admin-api-spec.yaml`)

#### 1.1 BbucleRoadPageDTO (lines 2317-2357)
- ✏️ `iconImageUrl` → `titleImageUrl`
- ❌ `location` 필드 제거
- ❌ `startAt` 필드 제거 (nullable)
- ❌ `endAt` 필드 제거 (nullable)
- ❌ `isActive` 필드 제거
- ✅ `summary: string[]` 유지

#### 1.2 BbucleRoadSectionTypeDTO (lines 2391-2401)
- ❌ `HEADER` 제거
- ❌ `SUMMARY` 제거

#### 1.3 BbucleRoadSectionDTO (lines 2359-2389)
- 📝 `mapConfig` nullable로 변경
- 📝 `markers` nullable로 변경
- required에서 제거

#### 1.4 Request DTO들 일괄 변경
- CreateBbucleRoadPageRequestDTO (lines 2463-2496)
- UpdateBbucleRoadPageRequestDTO (lines 2545-2578)
- CreateBbucleRoadSectionDTO (lines 2498-2525)
- UpdateBbucleRoadSectionDTO (lines 2580-2610)

### 2. App API 스펙 변경 (`subprojects/scc-api/api-spec.yaml`)

#### 2.1 GetBbucleRoadPageResponseDto (lines 4145-4170)
- ✏️ `iconImageUrl` → `titleImageUrl`
- ❌ `location` 필드 제거
- ✅ `summaryItems` 유지 (이미 배열)

#### 2.2 BbucleRoadSectionTypeDto (lines 4199-4209)
- ❌ `HEADER` 제거
- ❌ `SUMMARY` 제거
- ✏️ `WHEELCHAIR_VIEW` → `WHEELCHAIR_SIGHT`

#### 2.3 BbucleRoadSectionDto (lines 4172-4197)
- 📝 `mapCenter` nullable로 변경 (required에서 제거)
- 📝 `mapZoomLevel` nullable로 변경 (required에서 제거)
- 📝 `markers` nullable로 변경 (required에서 제거)
- ❌ `availableMarkerCategories` 필드 제거 (admin에서 distinct 처리)

#### 2.4 BbucleRoadSectionDto
- ➕ `title` 필드 추가 (섹션 제목)

#### 2.5 BbucleRoadMarkerTypeDto (lines 4231-4244)
- ✅ 변경 없음

---

### 3. 프론트엔드 변경 (Admin)

#### 3.1 페이지 폼 (`app/(private)/bbucleRoad/[id]/page.tsx`)
```typescript
type FormData = {
  title: string
  titleImageUrl: string  // 변경됨
  summary: string[]      // 동적 배열
  sections: (CreateBbucleRoadSectionDTO | UpdateBbucleRoadSectionDTO)[]
  // 제거: location, startAt, endAt, isActive
}
```

**변경 내용:**
- [x] ImageUploader label: "아이콘 이미지" → "타이틀 이미지"
- [x] 위치 입력 필드 제거
- [x] 활성화 기간 입력 필드 제거
- [x] 활성화 체크박스 제거
- [x] 요약을 useFieldArray로 변경
  - "줄 추가" 버튼
  - 각 줄마다 "삭제" 버튼 (최소 1줄 유지)

#### 3.2 섹션 에디터 (`app/(private)/bbucleRoad/components/SectionEditor.tsx`)
**변경 내용:**
- [x] HEADER, SUMMARY 타입 제거
- [x] WHEELCHAIR_VIEW → WHEELCHAIR_SIGHT
- [x] 제목: `<input>` → `<textarea>` (multiline)
- [x] 모든 섹션에 "지도 사용" 토글 추가
  - 체크 시: MapEditor 표시
  - 체크 해제 시: mapConfig/markers null

#### 3.3 지도 에디터 (`app/(private)/bbucleRoad/components/MapEditor.tsx`)
**주요 변경:**
- ⚡ **카카오 지도 → 네이버 지도**
  ```typescript
  // Before: Kakao Maps
  <Script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}" />
  const map = new kakao.maps.Map(container, options)

  // After: Naver Maps
  <Script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}" />
  const map = new naver.maps.Map(container, options)
  ```
- ❌ 카테고리 필터 UI 제거
- 🐛 버튼에 `type="button"` 추가

**네이버 지도 API 차이점:**
| 항목 | Kakao Maps | Naver Maps |
|------|------------|------------|
| 초기화 | `kakao.maps.Map` | `naver.maps.Map` |
| 좌표 | `kakao.maps.LatLng(lat, lng)` | `naver.maps.LatLng(lat, lng)` |
| 마커 | `kakao.maps.Marker` | `naver.maps.Marker` |
| 이벤트 | `kakao.maps.event.addListener` | `naver.maps.Event.addListener` |
| 줌 | level: 1-14 | zoom: 1-21 (스케일 다름) |

#### 3.4 테이블 컬럼 (`app/(private)/bbucleRoad/components/columns.tsx`)
- ✅ 변경 없음

---

### 4. 환경 설정

#### 4.1 환경 변수
```bash
# .env.local에 추가
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
```

#### 4.2 네이버 지도 타입 정의 (선택사항)
```typescript
// naver.maps.d.ts
declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    getCenter(): LatLng
    setZoom(zoom: number): void
    getZoom(): number
  }

  class LatLng {
    constructor(lat: number, lng: number)
    lat(): number
    lng(): number
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
  }

  class Event {
    static addListener(target: any, type: string, listener: Function): void
  }

  // ... 기타 필요한 타입들
}
```

---

### 5. 구현 순서

1. **API 스펙 변경**
   - [ ] `admin-api-spec.yaml` 수정
   - [ ] `api-spec.yaml` 수정

2. **타입 재생성**
   - [ ] `pnpm codegen`

3. **프론트엔드 변경**
   - [ ] `MapEditor.tsx` (네이버 지도 전환)
   - [ ] `SectionEditor.tsx` (타입 변경, 지도 optional)
   - [ ] `page.tsx` (폼 필드 변경, 요약 동적 관리)

4. **검증**
   - [ ] `pnpm typecheck`
   - [ ] `pnpm lint`
   - [ ] `pnpm build`
   - [ ] 실제 동작 확인

---

### 6. 주요 기술적 고려사항

#### 네이버 지도 줌 레벨 변환
- Kakao: level 1-14 (작을수록 확대)
- Naver: zoom 1-21 (클수록 확대)
- 변환 공식: `naverZoom = 15 - kakaoLevel` (대략적)

#### 지도 Optional 처리
- 섹션에서 `useMap` boolean state 관리
- false일 때: mapConfig, markers를 null로 설정
- true일 때: 기본값으로 초기화

#### 요약 동적 관리
- useFieldArray로 `summary` 배열 관리
- 초기값: 빈 배열 또는 기존 데이터
- 최소 1줄 유지 (삭제 버튼 조건부 렌더링)

---

### 7. API 변경 영향 범위

**Admin API 변경:**
- Admin 웹 어드민 페이지만 영향

**App API 변경:**
- 사용자 앱 (iOS/Android/Web)에 영향
- 기존 앱 버전과의 호환성 고려 필요
- 배포 시 앱 업데이트 필요 여부 확인

---

### 8. 상세 변경 사항

#### 8.1 admin-api-spec.yaml 변경 대상

**BbucleRoadPageDTO (line 2317)**
```yaml
# Before
properties:
  iconImageUrl:
    type: string
  location:
    $ref: '#/components/schemas/LocationDTO'
  startAt:
    type: string
    format: date-time
    nullable: true
  endAt:
    type: string
    format: date-time
    nullable: true
  isActive:
    type: boolean
required:
  - iconImageUrl
  - location
  - isActive

# After
properties:
  titleImageUrl:
    type: string
required:
  - titleImageUrl
```

**BbucleRoadSectionTypeDTO (line 2391)**
```yaml
# Before
enum:
  - HEADER
  - SUMMARY
  - MAP_OVERVIEW
  - TRAFFIC
  - TICKETING
  - WHEELCHAIR_VIEW
  - NEARBY_RESTAURANTS
  - NEARBY_CAFES

# After
enum:
  - MAP_OVERVIEW
  - TRAFFIC
  - TICKETING
  - WHEELCHAIR_SIGHT
  - NEARBY_RESTAURANTS
  - NEARBY_CAFES
```

**BbucleRoadSectionDTO (line 2359)**
```yaml
# Before
required:
  - id
  - type
  - title
  - mapConfig
  - markers
  - order

# After
required:
  - id
  - type
  - title
  - order
```

#### 8.2 api-spec.yaml 변경 대상

**GetBbucleRoadPageResponseDto (line 4145)**
```yaml
# Before
properties:
  iconImageUrl:
    type: string
  location:
    $ref: '#/components/schemas/Location'
required:
  - iconImageUrl
  - location

# After
properties:
  titleImageUrl:
    type: string
required:
  - titleImageUrl
```

**BbucleRoadSectionDto (line 4172)**
```yaml
# Before
required:
  - sectionType
  - markers

# After
required:
  - sectionType
```

그리고 `availableMarkerCategories` 필드 전체 제거 (lines 4185-4189)
