import { cachedFetch } from "./notion-cache"

/**
 * Notion 비공식 API (loadPageChunk)로 DB의 view 설정을 가져온다.
 * - column order (visible properties + 순서)
 * - sort config (property별 정렬 방향)
 *
 * 공식 API에서는 view 설정을 노출하지 않으므로 비공식 API 사용.
 * 1시간 캐싱. 비공식 API 실패 시 fallback 반환.
 */

export interface ViewConfig {
  /** Notion schema property name 순서 (visible only) */
  columnOrder: string[]
  /** 공식 API sorts 파라미터 형식 */
  sorts: Array<
    | { property: string; direction: "ascending" | "descending" }
    | { timestamp: "created_time" | "last_edited_time"; direction: "ascending" | "descending" }
  >
}

/** 유형 컬럼 정렬 우선순위: 팀리더 → 유닛리더 → 프론트 → 크루 → 게스트 → 나머지 */
const TYPE_SORT_ORDER = ["팀리더", "유닛리더", "프론트", "크루", "게스트"]

const FALLBACK_COLUMN_ORDER = ["이름", "조", "출석", "결석", "팀", "유형", "비고"]

const FALLBACK_SORTS: ViewConfig["sorts"] = [
  { property: "조", direction: "ascending" },
  { property: "이름", direction: "ascending" },
]

/**
 * databaseId로 해당 DB의 view config(sort + column order)를 가져온다.
 * Notion 비공식 API(loadPageChunk)에 databaseId를 직접 전달하면 view 설정이 반환됨.
 * 1시간 캐싱 (3600초). 비공식 API 실패 시 fallback.
 */
export async function getViewConfig(databaseId: string): Promise<ViewConfig> {
  return cachedFetch(
    `notion:view-config:${databaseId}`,
    () => fetchViewConfig(databaseId),
    3600,
  )
}

async function fetchViewConfig(databaseId: string): Promise<ViewConfig> {
  try {
    const res = await fetch("https://www.notion.so/api/v3/loadPageChunk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: databaseId,
        limit: 30,
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      }),
    })

    if (!res.ok) {
      return fallbackConfig()
    }

    const data = await res.json()
    const recordMap = data?.recordMap
    if (!recordMap) return fallbackConfig()

    // 1. Schema: property ID → name/type
    const schema = extractSchema(recordMap)
    if (!schema || Object.keys(schema).length === 0) return fallbackConfig()

    // 2. Find the table view (first one with type=table and format.table_properties)
    const views = recordMap.collection_view ?? {}
    let viewConfig: any = null

    for (const v of Object.values(views) as any[]) {
      const val = v?.value
      if (val?.type === "table" && val?.format?.table_properties) {
        viewConfig = val
        break
      }
    }

    if (!viewConfig) return fallbackConfig()

    // 3. Column order from table_properties
    const tableProps: any[] = viewConfig.format.table_properties ?? []
    const columnOrder = tableProps
      .filter((p: any) => p.visible !== false)
      .map((p: any) => schema[p.property]?.name)
      .filter((name: string | undefined): name is string => !!name)

    // 4. Sorts from query2.sort
    const rawSorts: any[] = viewConfig.query2?.sort ?? []
    const sorts: ViewConfig["sorts"] = rawSorts
      .map((s: any) => {
        const propName = schema[s.property]?.name
        if (!propName) return null
        return {
          property: propName,
          direction: s.direction as "ascending" | "descending",
        }
      })
      .filter((s: any): s is NonNullable<typeof s> => s !== null)

    return {
      columnOrder: columnOrder.length > 0 ? columnOrder : FALLBACK_COLUMN_ORDER,
      sorts: sorts.length > 0 ? sorts : FALLBACK_SORTS,
    }
  } catch {
    return fallbackConfig()
  }
}

function extractSchema(
  recordMap: any,
): Record<string, { name: string; type: string }> | null {
  const collections = recordMap.collection ?? {}
  for (const col of Object.values(collections) as any[]) {
    const schema = col?.value?.schema
    if (schema) return schema as Record<string, { name: string; type: string }>
  }
  return null
}

function fallbackConfig(): ViewConfig {
  return {
    columnOrder: FALLBACK_COLUMN_ORDER,
    sorts: FALLBACK_SORTS,
  }
}

/**
 * 유형 컬럼 기준 커스텀 정렬이 필요한 경우 클라이언트에서 사용.
 * Notion API sorts는 select 값의 커스텀 순서를 지원하지 않으므로,
 * 서버에서 rows를 가져온 후 클라이언트 또는 서버에서 재정렬한다.
 */
export function sortRowsByType(rows: any[]): any[] {
  return [...rows].sort((a, b) => {
    const aType = a.properties?.["유형"]?.select?.name ?? ""
    const bType = b.properties?.["유형"]?.select?.name ?? ""
    const aIdx = TYPE_SORT_ORDER.indexOf(aType)
    const bIdx = TYPE_SORT_ORDER.indexOf(bType)
    const aOrder = aIdx === -1 ? TYPE_SORT_ORDER.length : aIdx
    const bOrder = bIdx === -1 ? TYPE_SORT_ORDER.length : bIdx
    return aOrder - bOrder
  })
}
