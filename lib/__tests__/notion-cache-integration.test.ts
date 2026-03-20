/**
 * 실제 Notion API + Redis 통합 테스트.
 *
 * 대상 DB: '26 봄시즌 정복활동 출석부 (예시)
 * - DB ID: 314c9499-b060-80d0-98f9-e323eae14294
 * - 33 rows, checkbox 컬럼: "체크박스"
 *
 * 테스트 시나리오:
 * 1. Read 경로: cache miss → Notion fetch → cache hit (background sync)
 * 2. Write 경로: Notion PATCH → dirty marking → cache 직접 수정
 * 3. Dirty-aware sync: write 후 sync가 dirty 값 보호
 * 4. 동시성: 여러 read/write 동시 실행
 * 5. Latency 측정: p50/p95/p99
 *
 * 주의: 테스트 후 checkbox를 원래 값으로 복원.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import Redis from "ioredis"
import { Client } from "@notionhq/client"

// --- 직접 Redis/Notion 인스턴스 생성 (모듈 mock 안 씀) ---
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379"
const NOTION_TOKEN = process.env.NOTION_ATTENDANCE_API_TOKEN!
const DB_ID = "314c9499-b060-80d0-98f9-e323eae14294"

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true })
const notion = new Client({ auth: NOTION_TOKEN })

// --- Helpers ---

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

interface Stats {
  count: number
  min: number
  max: number
  mean: number
  p50: number
  p95: number
  p99: number
  errors: number
  errorRate: string
}

function computeStats(latencies: number[], errors: number): Stats {
  const sorted = [...latencies].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  return {
    count: sorted.length,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    mean: Math.round((sum / sorted.length) * 100) / 100,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    errors,
    errorRate: `${((errors / (sorted.length + errors)) * 100).toFixed(1)}%`,
  }
}

function printStats(label: string, stats: Stats) {
  console.log(`\n=== ${label} ===`)
  console.log(`  ops: ${stats.count}, errors: ${stats.errors} (${stats.errorRate})`)
  console.log(
    `  latency (ms): min=${stats.min.toFixed(1)}, p50=${stats.p50.toFixed(1)}, p95=${stats.p95.toFixed(1)}, p99=${stats.p99.toFixed(1)}, max=${stats.max.toFixed(1)}`,
  )
  console.log(`  mean=${stats.mean.toFixed(1)}ms`)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// --- Notion API helpers (route 로직 재현) ---

interface CachedValue<T> {
  data: T
  logicalExpiresAt: number
}

async function notionQueryPage(
  databaseId: string,
  startCursor?: string,
): Promise<any> {
  const body: Record<string, unknown> = {
    sorts: [
      { property: "조", direction: "ascending" },
      { timestamp: "created_time", direction: "ascending" },
    ],
  }
  if (startCursor) body.start_cursor = startCursor

  const res = await fetch(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  )
  if (!res.ok) throw new Error(`Notion query failed: ${res.status}`)
  return res.json()
}

async function notionQueryAll(databaseId: string): Promise<any[]> {
  const first = await notionQueryPage(databaseId)
  const all = [...first.results]
  let cursor = first.next_cursor
  while (cursor) {
    const next = await notionQueryPage(databaseId, cursor)
    all.push(...next.results)
    cursor = next.next_cursor
  }
  return all
}

async function setCache<T>(key: string, data: T, ttlSeconds: number) {
  const value: CachedValue<T> = {
    data,
    logicalExpiresAt: Date.now() + ttlSeconds * 1000,
  }
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds * 2)
}

async function getCache<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  if (!raw) return null
  const cached: CachedValue<T> = JSON.parse(raw)
  return cached.data
}

/**
 * Per-key lock for cache read-modify-write.
 * 동시 writeCheckbox가 같은 캐시 키를 GET→modify→SET하면 lost update 발생.
 * 실제 구현(notion-cache.ts)의 updateChains와 동일한 역할.
 */
const cacheUpdateChains = new Map<string, Promise<void>>()

/** Write 경로: Notion PATCH → dirty mark → cache 수정 */
async function writeCheckbox(
  rowId: string,
  dbId: string,
  propName: string,
  checked: boolean,
): Promise<{ notionMs: number; cacheMs: number }> {
  // 1. Notion API PATCH
  const t0 = performance.now()
  await notion.pages.update({
    page_id: rowId,
    properties: {
      [propName]: { checkbox: checked },
    },
  })
  const notionMs = performance.now() - t0

  // 2. Dirty flag
  const t1 = performance.now()
  await redis.hset(
    `notion:writes:${dbId}`,
    `${rowId}:${propName}`,
    String(checked),
  )
  await redis.expire(`notion:writes:${dbId}`, 120)

  // 3. Cache 직접 수정 (per-key lock으로 직렬화)
  const cacheKey = `notion:db-rows:${dbId}`
  const prev = cacheUpdateChains.get(cacheKey) ?? Promise.resolve()
  const current = prev.then(async () => {
    const raw = await redis.get(cacheKey)
    if (raw) {
      const cached: CachedValue<any[]> = JSON.parse(raw)
      cached.data = cached.data.map((row: any) => {
        if (row.id !== rowId) return row
        return {
          ...row,
          properties: {
            ...row.properties,
            [propName]: { ...row.properties[propName], checkbox: checked },
          },
        }
      })
      const ttl = await redis.ttl(cacheKey)
      if (ttl > 0) {
        await redis.set(cacheKey, JSON.stringify(cached), "EX", ttl)
      }
    }
  })
  cacheUpdateChains.set(cacheKey, current.catch(() => {}))
  await current
  const cacheMs = performance.now() - t1

  return { notionMs, cacheMs }
}

// --- Cleanup ---

const CACHE_KEYS = [
  `notion:db-rows:${DB_ID}`,
  `notion:db-schema:${DB_ID}`,
  `notion:last-sync:${DB_ID}`,
  `notion:sync-lock:${DB_ID}`,
  `notion:writes:${DB_ID}`,
]

async function cleanupRedis() {
  for (const key of CACHE_KEYS) {
    await redis.del(key).catch(() => {})
  }
}

// --- Tests ---

beforeAll(async () => {
  if (!NOTION_TOKEN) {
    throw new Error(
      "NOTION_ATTENDANCE_API_TOKEN required. Set it in env before running.",
    )
  }
  await redis.connect()
  await cleanupRedis()
})

afterAll(async () => {
  await cleanupRedis()
  await redis.quit()
})

beforeEach(async () => {
  await cleanupRedis()
})

describe("통합 테스트 — 실제 Notion API + Redis", () => {
  // ---- READ 경로 ----

  it("cache miss → Notion fetch → 33 rows 반환 + latency 측정", async () => {
    const t0 = performance.now()
    const rows = await notionQueryAll(DB_ID)
    const fetchMs = performance.now() - t0

    console.log(`\n=== Notion DB full fetch ===`)
    console.log(`  rows: ${rows.length}, latency: ${fetchMs.toFixed(1)}ms`)

    expect(rows.length).toBeGreaterThanOrEqual(30)

    // Cache에 저장
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)
    const cached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
    expect(cached).not.toBeNull()
    expect(cached!.length).toBe(rows.length)
  }, 30_000)

  it("cache hit → Redis에서 즉시 반환 (Notion 호출 없음)", async () => {
    // Warm cache
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    // Cache hit 측정 — 10회
    const latencies: number[] = []
    for (let i = 0; i < 10; i++) {
      const t0 = performance.now()
      const raw = await redis.get(`notion:db-rows:${DB_ID}`)
      JSON.parse(raw!)
      latencies.push(performance.now() - t0)
    }

    const stats = computeStats(latencies, 0)
    printStats("cache hit read (10회)", stats)

    // Redis 응답은 sub-5ms여야 함
    expect(stats.p95).toBeLessThan(5)
  }, 30_000)

  it("60명 동시 cache hit read — p50/p95 측정", async () => {
    // Warm cache
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    const latencies: number[] = []
    let errors = 0

    await Promise.all(
      Array.from({ length: 60 }, async () => {
        const t0 = performance.now()
        try {
          const raw = await redis.get(`notion:db-rows:${DB_ID}`)
          JSON.parse(raw!)
        } catch {
          errors++
        }
        latencies.push(performance.now() - t0)
      }),
    )

    const stats = computeStats(latencies, errors)
    printStats("60명 동시 cache hit read", stats)

    expect(stats.errors).toBe(0)
    // Docker Redis (non-local) → 60 concurrent connections → p95 ~30ms 가능
    expect(stats.p95).toBeLessThan(50)
  }, 30_000)

  // ---- WRITE 경로 ----

  it("단일 write — Notion PATCH + cache 수정 latency", async () => {
    // Warm cache
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    const testRow = rows[0]
    const originalCheckbox = testRow.properties["체크박스"].checkbox

    try {
      // Toggle
      const { notionMs, cacheMs } = await writeCheckbox(
        testRow.id,
        DB_ID,
        "체크박스",
        !originalCheckbox,
      )

      console.log(`\n=== 단일 write ===`)
      console.log(`  Notion PATCH: ${notionMs.toFixed(1)}ms`)
      console.log(`  Cache 수정: ${cacheMs.toFixed(1)}ms`)
      console.log(`  합계: ${(notionMs + cacheMs).toFixed(1)}ms`)

      // Cache에 즉시 반영됐는지 확인
      const cached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      const updatedRow = cached!.find((r: any) => r.id === testRow.id)
      expect(updatedRow.properties["체크박스"].checkbox).toBe(!originalCheckbox)

      // Notion PATCH는 <3초
      expect(notionMs).toBeLessThan(3000)
      // Cache 수정은 <10ms
      expect(cacheMs).toBeLessThan(10)
    } finally {
      // 원래 값 복원
      await notion.pages.update({
        page_id: testRow.id,
        properties: { 체크박스: { checkbox: originalCheckbox } },
      })
    }
  }, 30_000)

  it("5명 연속 write — Notion PATCH latency 분포", async () => {
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    const testRows = rows.slice(0, 5)
    const originals = testRows.map(
      (r: any) => r.properties["체크박스"].checkbox as boolean,
    )

    const notionLatencies: number[] = []
    const cacheLatencies: number[] = []
    let errors = 0

    try {
      // 순차 write (실제 사용 패턴 — 사용자가 한 명씩 체크)
      for (let i = 0; i < testRows.length; i++) {
        try {
          const { notionMs, cacheMs } = await writeCheckbox(
            testRows[i].id,
            DB_ID,
            "체크박스",
            !originals[i],
          )
          notionLatencies.push(notionMs)
          cacheLatencies.push(cacheMs)
        } catch {
          errors++
        }
      }

      const notionStats = computeStats(notionLatencies, errors)
      const cacheStats = computeStats(cacheLatencies, 0)
      printStats("5명 연속 write — Notion PATCH", notionStats)
      printStats("5명 연속 write — Cache 수정", cacheStats)

      // 에러 없어야 함
      expect(errors).toBe(0)
      // Notion p95: 테스트 suite 전체 write 누적으로 rate limit 근접 가능
      // 실서비스에서는 write가 분산되므로 p95 < 2초 기대
      // 여기선 rate limit 포함해도 10초 미만이면 OK
      expect(notionStats.p95).toBeLessThan(10_000)
      // Cache p95 < 20ms (Docker Redis + per-key lock 대기 포함)
      expect(cacheStats.p95).toBeLessThan(20)
    } finally {
      // 원래 값 복원
      for (let i = 0; i < testRows.length; i++) {
        await notion.pages.update({
          page_id: testRows[i].id,
          properties: { 체크박스: { checkbox: originals[i] } },
        }).catch(() => {})
      }
    }
  }, 60_000)

  it("3명 동시 write — 동시성 + latency", async () => {
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    const testRows = rows.slice(5, 8) // row 5,6,7
    const originals = testRows.map(
      (r: any) => r.properties["체크박스"].checkbox as boolean,
    )

    const notionLatencies: number[] = []
    let errors = 0

    try {
      await Promise.all(
        testRows.map(async (row: any, i: number) => {
          const t0 = performance.now()
          try {
            await writeCheckbox(row.id, DB_ID, "체크박스", !originals[i])
            notionLatencies.push(performance.now() - t0)
          } catch {
            errors++
            notionLatencies.push(performance.now() - t0)
          }
        }),
      )

      const stats = computeStats(notionLatencies, errors)
      printStats("3명 동시 write (Notion + cache)", stats)

      // Cache에 모두 반영됐는지
      const cached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      for (let i = 0; i < testRows.length; i++) {
        const row = cached!.find((r: any) => r.id === testRows[i].id)
        expect(row.properties["체크박스"].checkbox).toBe(!originals[i])
      }

      expect(errors).toBe(0)
    } finally {
      for (let i = 0; i < testRows.length; i++) {
        await notion.pages.update({
          page_id: testRows[i].id,
          properties: { 체크박스: { checkbox: originals[i] } },
        }).catch(() => {})
        await sleep(350) // rate limit 보호
      }
    }
  }, 60_000)

  // ---- DIRTY-AWARE SYNC ----

  it("write 후 sync → dirty flag가 값을 보호", async () => {
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    const testRow = rows[0]
    const original = testRow.properties["체크박스"].checkbox as boolean

    try {
      // 1. Write: checkbox toggle
      await writeCheckbox(testRow.id, DB_ID, "체크박스", !original)

      // 2. Sync 시뮬: Notion에서 다시 fetch (PATCH가 아직 반영 안 됐다고 가정)
      // 실제로는 반영됐겠지만, dirty flag가 보호하는지 테스트
      const dirtyKey = `notion:writes:${DB_ID}`
      const dirtyVal = await redis.hget(dirtyKey, `${testRow.id}:체크박스`)
      console.log(`\n=== dirty flag 확인 ===`)
      console.log(`  dirty value: ${dirtyVal} (expected: ${!original})`)

      expect(dirtyVal).toBe(String(!original))

      // 3. Sync: stale data로 캐시 덮어쓰기 시도
      const staleRows = rows.map((r: any) => ({ ...r })) // original data (toggle 전)
      // Dirty-aware merge
      const dirty = await redis.hgetall(dirtyKey)
      const merged = staleRows.map((row: any) => {
        const result = { ...row, properties: { ...row.properties } }
        for (const [key, value] of Object.entries(dirty)) {
          const sepIdx = key.indexOf(":")
          const rowId = key.slice(0, sepIdx)
          const propName = key.slice(sepIdx + 1)
          if (rowId === row.id && result.properties[propName]?.type === "checkbox") {
            result.properties[propName] = {
              ...result.properties[propName],
              checkbox: value === "true",
            }
          }
        }
        return result
      })
      await setCache(`notion:db-rows:${DB_ID}`, merged, 60)

      // 4. 검증: dirty flag 덕분에 toggle 값 유지
      const cached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      const cachedRow = cached!.find((r: any) => r.id === testRow.id)
      expect(cachedRow.properties["체크박스"].checkbox).toBe(!original)
      console.log(`  sync 후 캐시 값: ${cachedRow.properties["체크박스"].checkbox} (보호됨)`)
    } finally {
      await notion.pages.update({
        page_id: testRow.id,
        properties: { 체크박스: { checkbox: original } },
      })
    }
  }, 30_000)

  // ---- MIXED WORKLOAD ----

  it("mixed: 10 read + 3 write 동시 — 이벤트 현장 시뮬", async () => {
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 60)

    const writeRows = rows.slice(10, 13)
    const originals = writeRows.map(
      (r: any) => r.properties["체크박스"].checkbox as boolean,
    )

    const readLatencies: number[] = []
    const writeLatencies: number[] = []
    let readErrors = 0
    let writeErrors = 0

    try {
      const readPromises = Array.from({ length: 10 }, async () => {
        const t0 = performance.now()
        try {
          const raw = await redis.get(`notion:db-rows:${DB_ID}`)
          JSON.parse(raw!)
        } catch {
          readErrors++
        }
        readLatencies.push(performance.now() - t0)
      })

      const writePromises = writeRows.map(async (row: any, i: number) => {
        const t0 = performance.now()
        try {
          await writeCheckbox(row.id, DB_ID, "체크박스", !originals[i])
        } catch {
          writeErrors++
        }
        writeLatencies.push(performance.now() - t0)
      })

      await Promise.all([...readPromises, ...writePromises])

      const readStats = computeStats(readLatencies, readErrors)
      const writeStats = computeStats(writeLatencies, writeErrors)
      printStats("mixed read (10 concurrent, Redis only)", readStats)
      printStats("mixed write (3 concurrent, Notion + Redis)", writeStats)

      expect(readErrors).toBe(0)
      expect(writeErrors).toBe(0)
      expect(readStats.p95).toBeLessThan(50)
      // Notion API write: rate limit 근접 시 최대 ~6초, 10초 미만이면 OK
      expect(writeStats.p95).toBeLessThan(10_000)
    } finally {
      for (let i = 0; i < writeRows.length; i++) {
        await notion.pages.update({
          page_id: writeRows[i].id,
          properties: { 체크박스: { checkbox: originals[i] } },
        }).catch(() => {})
        await sleep(350)
      }
    }
  }, 60_000)

  // ---- 동시성 시나리오 ----

  it("동시성 #1: 같은 row 동시 write — lost update 검증", async () => {
    /**
     * 시나리오: 2명이 동시에 같은 row를 토글.
     * A: false → true, B: true → false (A 이후)
     *
     * 위험: A와 B가 동시에 캐시 GET → 같은 base → 각자 수정 → 마지막 SET이 이전 것을 덮어씀
     * 기대: per-key lock(updateChains)이 직렬화 → 두 write 모두 정확히 반영
     *
     * 검증 방법:
     * - 같은 row에 대해 동시에 writeCheckbox를 N번 호출
     * - 최종 캐시 값이 마지막 write와 일치하는지 확인
     * - Notion API 최종 값도 일치하는지 확인
     */
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 120)

    const testRow = rows[0]
    const original = testRow.properties["체크박스"].checkbox as boolean

    try {
      // 5명이 동시에 같은 row를 토글 (교대로 true/false)
      const CONCURRENT = 5
      const writes: { value: boolean; order: number }[] = []
      for (let i = 0; i < CONCURRENT; i++) {
        writes.push({ value: i % 2 === 0 ? !original : original, order: i })
      }

      console.log(`\n=== 동시성 #1: 같은 row 동시 write ${CONCURRENT}건 ===`)
      console.log(`  original: ${original}`)
      console.log(`  writes: ${writes.map((w) => w.value).join(", ")}`)

      // 동시 발사 — writeCheckbox 내부의 cacheUpdateChains가 직렬화해야 함
      const results = await Promise.allSettled(
        writes.map((w) =>
          writeCheckbox(testRow.id, DB_ID, "체크박스", w.value),
        ),
      )

      const succeeded = results.filter((r) => r.status === "fulfilled").length
      const failed = results.filter((r) => r.status === "rejected").length
      console.log(`  성공: ${succeeded}, 실패: ${failed}`)

      // 마지막으로 성공한 write의 값이 캐시에 있어야 함
      // Promise.allSettled 순서 = writes 순서이므로, 마지막 성공한 값 찾기
      let lastSuccessValue: boolean | null = null
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i].status === "fulfilled") {
          lastSuccessValue = writes[i].value
          break
        }
      }

      const cached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      const cachedRow = cached!.find((r: any) => r.id === testRow.id)
      const cachedValue = cachedRow.properties["체크박스"].checkbox

      console.log(`  마지막 성공 write: ${lastSuccessValue}`)
      console.log(`  캐시 값: ${cachedValue}`)

      // 핵심 검증: 캐시가 마지막 성공 write와 일치
      expect(cachedValue).toBe(lastSuccessValue)

      // Notion도 확인
      await sleep(500)
      const fresh = await notionQueryAll(DB_ID)
      const freshRow = fresh.find((r: any) => r.id === testRow.id)
      console.log(`  Notion 값: ${freshRow.properties["체크박스"].checkbox}`)
      // Notion 값은 마지막으로 성공한 PATCH 기준 — 순서가 보장 안 될 수 있음
      // 하지만 캐시는 반드시 정확해야 함 (이게 핵심)
    } finally {
      await notion.pages.update({
        page_id: testRow.id,
        properties: { 체크박스: { checkbox: original } },
      }).catch(() => {})
    }
  }, 60_000)

  it("동시성 #2: write + sync race — dirty flag 보호 검증", async () => {
    /**
     * 시나리오: PATCH 성공 직후, background sync가 old data로 캐시를 덮어씀.
     *
     * 타임라인:
     * T0: 캐시에 row-X:체크박스=false
     * T1: PATCH row-X:체크박스=true → Notion 성공
     * T2: markDirty("row-X:체크박스", "true")
     * T3: updateCachedRows → 캐시에 row-X:체크박스=true
     * T4: background sync → Notion에서 fetch → row-X:체크박스=false (old)
     *     → dirty flag 있으므로 → merge 결과: row-X:체크박스=true (보호됨!)
     *
     * 검증: T4 이후에도 캐시 값이 true인지
     */
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 120)

    const testRow = rows[1]
    const original = testRow.properties["체크박스"].checkbox as boolean

    try {
      // 1. Write: toggle
      const newVal = !original
      await writeCheckbox(testRow.id, DB_ID, "체크박스", newVal)

      // dirty flag 확인
      const dirtyBefore = await redis.hget(
        `notion:writes:${DB_ID}`,
        `${testRow.id}:체크박스`,
      )

      console.log(`\n=== 동시성 #2: write + sync race ===`)
      console.log(`  original: ${original}, written: ${newVal}`)
      console.log(`  dirty flag: ${dirtyBefore}`)

      // 2. Sync 시뮬: old data로 캐시 덮어쓰기 (dirty-aware merge 적용)
      const staleRows = rows.map((r: any) => ({
        ...r,
        properties: { ...r.properties },
      }))

      // dirty 목록 가져와서 merge
      const dirty = await redis.hgetall(`notion:writes:${DB_ID}`)
      const merged = staleRows.map((row: any) => {
        const result = { ...row, properties: { ...row.properties } }
        for (const [key, value] of Object.entries(dirty)) {
          const sepIdx = key.indexOf(":")
          const rowId = key.slice(0, sepIdx)
          const propName = key.slice(sepIdx + 1)
          if (
            rowId === row.id &&
            result.properties[propName]?.type === "checkbox"
          ) {
            result.properties[propName] = {
              ...result.properties[propName],
              checkbox: value === "true",
            }
          }
        }
        return result
      })
      await setCache(`notion:db-rows:${DB_ID}`, merged, 120)

      // 3. 검증: dirty 보호 덕분에 write 값 유지
      const cached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      const cachedRow = cached!.find((r: any) => r.id === testRow.id)
      console.log(`  sync 후 캐시 값: ${cachedRow.properties["체크박스"].checkbox}`)
      expect(cachedRow.properties["체크박스"].checkbox).toBe(newVal)

      // 4. dirty flag 없이 sync하면? → old data로 덮어써짐 (대조군)
      await redis.del(`notion:writes:${DB_ID}`)
      const noDirtyMerge = staleRows // dirty 없으므로 merge 없음
      await setCache(`notion:db-rows:${DB_ID}`, noDirtyMerge, 120)

      const cachedNoDirty = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      const rowNoDirty = cachedNoDirty!.find(
        (r: any) => r.id === testRow.id,
      )
      console.log(
        `  dirty 없이 sync 시 캐시 값: ${rowNoDirty.properties["체크박스"].checkbox} (=original ${original}, 덮어써짐!)`,
      )
      // dirty 없으면 old data로 돌아감 — 이게 dirty flag가 필요한 이유
      expect(rowNoDirty.properties["체크박스"].checkbox).toBe(original)
    } finally {
      await notion.pages.update({
        page_id: testRow.id,
        properties: { 체크박스: { checkbox: original } },
      }).catch(() => {})
    }
  }, 60_000)

  it("동시성 #3: write 중 read — stale window 측정", async () => {
    /**
     * 시나리오: write가 Notion PATCH 중일 때 (1~2초), 그 사이에 read하면
     * 아직 캐시가 업데이트 안 된 stale 데이터를 읽게 된다.
     *
     * 타임라인:
     * T0: row-X:체크박스=false (캐시)
     * T1: PATCH 시작 (Notion API 호출 중... 1~2초)
     * T2: 다른 사용자가 read → 캐시에서 false 반환 (stale!)
     * T3: PATCH 완료 → cache 수정 → true
     * T4: 다른 사용자가 read → 캐시에서 true 반환 (fresh)
     *
     * 측정: T1~T3 사이의 stale window 길이
     * 검증: stale window 이후에는 반드시 fresh 값이 보임
     */
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 120)

    const testRow = rows[2]
    const original = testRow.properties["체크박스"].checkbox as boolean
    const newVal = !original

    try {
      console.log(`\n=== 동시성 #3: write 중 read — stale window ===`)
      console.log(`  original: ${original}, target: ${newVal}`)

      const readResults: { time: number; value: boolean }[] = []
      let writeCompleteTime = 0

      // Writer: Notion PATCH + cache 수정
      const writePromise = (async () => {
        await writeCheckbox(testRow.id, DB_ID, "체크박스", newVal)
        writeCompleteTime = performance.now()
      })()

      // Reader: write가 끝날 때까지 20ms 간격으로 polling
      const readerPromise = (async () => {
        const startTime = performance.now()
        while (performance.now() - startTime < 10_000) {
          // 10초 timeout
          const raw = await redis.get(`notion:db-rows:${DB_ID}`)
          if (raw) {
            const cached: CachedValue<any[]> = JSON.parse(raw)
            const row = cached.data.find((r: any) => r.id === testRow.id)
            if (row) {
              readResults.push({
                time: performance.now(),
                value: row.properties["체크박스"].checkbox,
              })
            }
          }

          // write 끝났고 fresh 값을 한번 더 읽었으면 종료
          if (
            writeCompleteTime > 0 &&
            performance.now() > writeCompleteTime + 100
          ) {
            // 한번 더 읽기
            const raw2 = await redis.get(`notion:db-rows:${DB_ID}`)
            if (raw2) {
              const cached2: CachedValue<any[]> = JSON.parse(raw2)
              const row2 = cached2.data.find(
                (r: any) => r.id === testRow.id,
              )
              if (row2) {
                readResults.push({
                  time: performance.now(),
                  value: row2.properties["체크박스"].checkbox,
                })
              }
            }
            break
          }

          await sleep(20) // 20ms polling
        }
      })()

      const writeStartTime = performance.now()
      await Promise.all([writePromise, readerPromise])

      // --- 분석 ---
      const staleReads = readResults.filter((r) => r.value === original)
      const freshReads = readResults.filter((r) => r.value === newVal)

      // stale window = write 시작 ~ 캐시 업데이트 완료
      const staleWindowMs = writeCompleteTime - writeStartTime

      // 마지막 stale read 시점
      const lastStaleTime =
        staleReads.length > 0
          ? staleReads[staleReads.length - 1].time
          : writeStartTime
      // 첫 fresh read 시점
      const firstFreshTime =
        freshReads.length > 0 ? freshReads[0].time : writeCompleteTime

      console.log(`  총 read 횟수: ${readResults.length}`)
      console.log(
        `  stale reads: ${staleReads.length}, fresh reads: ${freshReads.length}`,
      )
      console.log(`  stale window: ${staleWindowMs.toFixed(0)}ms (= Notion PATCH 시간)`)
      console.log(
        `  마지막 stale → 첫 fresh: ${(firstFreshTime - lastStaleTime).toFixed(0)}ms`,
      )

      // 검증 1: write 완료 후에는 반드시 fresh
      const readsAfterWrite = readResults.filter(
        (r) => r.time > writeCompleteTime,
      )
      const staleAfterWrite = readsAfterWrite.filter(
        (r) => r.value === original,
      )
      console.log(
        `  write 완료 후 read: ${readsAfterWrite.length}건, stale: ${staleAfterWrite.length}건`,
      )
      expect(staleAfterWrite.length).toBe(0)

      // 검증 2: stale window 동안 stale read가 존재 (이건 당연하지만 문서화)
      // Notion PATCH가 1초 이상 걸리므로 stale read가 있어야 정상
      console.log(
        `  (stale reads 존재 = 정상: Notion PATCH ${staleWindowMs.toFixed(0)}ms 동안 캐시는 아직 old)`,
      )
      if (staleWindowMs > 200) {
        // PATCH가 200ms 이상이면 stale read가 있어야 함
        expect(staleReads.length).toBeGreaterThan(0)
      }

      // 검증 3: 최종 캐시 값은 무조건 newVal
      const finalCached = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      const finalRow = finalCached!.find((r: any) => r.id === testRow.id)
      expect(finalRow.properties["체크박스"].checkbox).toBe(newVal)
    } finally {
      await notion.pages.update({
        page_id: testRow.id,
        properties: { 체크박스: { checkbox: original } },
      }).catch(() => {})
    }
  }, 60_000)

  // ---- 실전 시나리오: 60명 read + 10초마다 1명 체크 ----

  it("실전 시뮬: 60명 폴링(5초) + 사람마다 10초에 1번 체크 × 20초", async () => {
    /**
     * 시나리오:
     * - 60명이 5초마다 GET /notion/database/{dbId} 폴링 (= cache hit read)
     * - 각 사용자가 평균 10초에 1번 checkbox 토글
     *   → 60명 / 10초 = 6 writes/sec 평균
     *   → 20초간 = 120 writes
     * - DB에 33 rows → row를 round-robin으로 재사용 (같은 row 여러 번 토글)
     *
     * 검증:
     * 1. Read p50/p95 latency
     * 2. Write p50/p95 latency (Notion API + cache 수정)
     * 3. Write 에러율 (429 rate limit 포함)
     * 4. 동시성: 성공한 write가 캐시에 정확히 반영 (lost update 없음)
     * 5. 최종 캐시 vs Notion API 일치
     *
     * Rate limit 참고:
     * - Notion API limit: ~3 req/s
     * - 6 writes/sec > limit → 429 에러 발생 예상
     * - 이게 실제로 얼마나 터지는지가 핵심 측정 포인트
     */

    // --- Setup ---
    const rows = await notionQueryAll(DB_ID)
    await setCache(`notion:db-rows:${DB_ID}`, rows, 300)

    const DURATION_S = 20
    const POLL_INTERVAL_MS = 5_000
    const READERS = 60
    const TOTAL_WRITES = 120 // 60명 × 2회 (20초 / 10초)
    const WRITE_INTERVAL_MS = Math.floor((DURATION_S * 1000) / TOTAL_WRITES) // ~167ms

    const originalValues = new Map<string, boolean>(
      rows.map((r: any) => [r.id, r.properties["체크박스"].checkbox]),
    )

    const readLatencies: number[] = []
    const writeLatencies: number[] = []
    const writeNotionLatencies: number[] = []
    const writeCacheLatencies: number[] = []
    let readErrors = 0
    let writeErrors = 0
    let write429s = 0
    let writeSuccesses = 0

    // 기대 상태 추적 — 성공한 write만 반영
    const expectedState = new Map<string, boolean>(originalValues)
    // write 순서 직렬화 (같은 row 동시 수정 방지)
    const rowWriteLocks = new Map<string, Promise<void>>()

    console.log(`\n=== 실전 시뮬 시작 ===`)
    console.log(`  readers: ${READERS}명, polling: ${POLL_INTERVAL_MS}ms`)
    console.log(`  writes: ${TOTAL_WRITES}건 (${(1000 / WRITE_INTERVAL_MS).toFixed(1)} req/s), interval: ${WRITE_INTERVAL_MS}ms`)
    console.log(`  Notion rate limit: ~3 req/s → 429 에러 예상`)

    const testStart = performance.now()

    try {
      // --- Reader: 60명이 5초마다 polling ---
      const readerDone = (async () => {
        const rounds = Math.floor(DURATION_S * 1000 / POLL_INTERVAL_MS)
        for (let round = 0; round < rounds; round++) {
          await Promise.all(
            Array.from({ length: READERS }, async () => {
              const t0 = performance.now()
              try {
                const raw = await redis.get(`notion:db-rows:${DB_ID}`)
                if (raw) JSON.parse(raw)
              } catch {
                readErrors++
              }
              readLatencies.push(performance.now() - t0)
            }),
          )
          if (round < rounds - 1) await sleep(POLL_INTERVAL_MS)
        }
      })()

      // --- Writer: 120건, ~167ms 간격 (6 req/s) ---
      const writerDone = (async () => {
        for (let i = 0; i < TOTAL_WRITES; i++) {
          const row = rows[i % rows.length]
          const rowId = row.id

          // 같은 row에 대한 write 직렬화
          const prev = rowWriteLocks.get(rowId) ?? Promise.resolve()
          const current = prev.then(async () => {
            const newVal = !expectedState.get(rowId)!

            const t0 = performance.now()
            try {
              const { notionMs, cacheMs } = await writeCheckbox(
                rowId,
                DB_ID,
                "체크박스",
                newVal,
              )
              writeNotionLatencies.push(notionMs)
              writeCacheLatencies.push(cacheMs)
              writeSuccesses++
              // 성공 시에만 기대 상태 업데이트
              expectedState.set(rowId, newVal)
            } catch (e: any) {
              writeErrors++
              if (e?.status === 429 || e?.message?.includes("429")) {
                write429s++
              }
            }
            writeLatencies.push(performance.now() - t0)
          })
          rowWriteLocks.set(rowId, current.catch(() => {}))

          // 다음 write까지 대기
          if (i < TOTAL_WRITES - 1) {
            await sleep(WRITE_INTERVAL_MS)
          }
        }
        // 모든 in-flight write 완료 대기
        await Promise.all([...rowWriteLocks.values()])
      })()

      await Promise.all([readerDone, writerDone])

      const totalDuration = performance.now() - testStart

      // --- Stats ---
      const readStats = computeStats(readLatencies, readErrors)
      const writeAllStats = computeStats(writeLatencies, writeErrors)
      const notionStats = writeNotionLatencies.length > 0
        ? computeStats(writeNotionLatencies, 0)
        : null
      const cacheStats = writeCacheLatencies.length > 0
        ? computeStats(writeCacheLatencies, 0)
        : null

      printStats(`READ (${READERS}명 × ${Math.floor(DURATION_S * 1000 / POLL_INTERVAL_MS)}라운드 = ${readLatencies.length}ops)`, readStats)
      printStats(`WRITE 전체 (${writeLatencies.length}건 시도)`, writeAllStats)
      if (notionStats) printStats(`WRITE — Notion PATCH (${writeSuccesses}건 성공)`, notionStats)
      if (cacheStats) printStats(`WRITE — Cache 수정 (${writeSuccesses}건)`, cacheStats)

      console.log(`\n=== Write 결과 ===`)
      console.log(`  시도: ${TOTAL_WRITES}, 성공: ${writeSuccesses}, 실패: ${writeErrors}`)
      console.log(`  429 rate limit: ${write429s}건`)
      console.log(`  에러율: ${((writeErrors / TOTAL_WRITES) * 100).toFixed(1)}%`)
      console.log(`  총 시뮬 시간: ${(totalDuration / 1000).toFixed(1)}초`)

      // --- 1. Latency 검증 ---
      expect(readStats.errors).toBe(0)
      // Read: Redis only → p95 < 50ms
      expect(readStats.p95).toBeLessThan(50)
      // Write 에러율: 429 포함해서 50% 미만이면 OK (rate limit이 심하면 높을 수 있음)
      expect(writeErrors / TOTAL_WRITES).toBeLessThan(0.5)

      // --- 2. 동시성: 캐시 정합성 검증 (성공한 write만) ---
      console.log(`\n=== 동시성 검증 ===`)
      const cachedRows = await getCache<any[]>(`notion:db-rows:${DB_ID}`)
      expect(cachedRows).not.toBeNull()

      let correctCount = 0
      let mismatchCount = 0
      const mismatches: string[] = []

      // 성공한 write에 대해서만 검증
      for (const [rowId, expected] of expectedState) {
        const cached = cachedRows!.find((r: any) => r.id === rowId)
        if (!cached) {
          mismatches.push(`  ${rowId}: NOT FOUND in cache`)
          mismatchCount++
          continue
        }
        const actual = cached.properties["체크박스"].checkbox
        if (actual === expected) {
          correctCount++
        } else {
          mismatches.push(`  ${rowId}: expected=${expected}, actual=${actual}`)
          mismatchCount++
        }
      }

      console.log(`  캐시 정합성: ${correctCount}/${expectedState.size} correct`)
      if (mismatches.length > 0) {
        console.log(`  불일치:`)
        mismatches.forEach((m) => console.log(m))
      }
      expect(mismatchCount).toBe(0)

      // --- 3. Notion API와 최종 일치 확인 ---
      console.log(`\n=== Notion API 최종 검증 ===`)
      await sleep(1000)
      const freshRows = await notionQueryAll(DB_ID)
      let notionCorrect = 0
      let notionMismatch = 0

      for (const [rowId, expected] of expectedState) {
        const fresh = freshRows.find((r: any) => r.id === rowId)
        if (fresh?.properties["체크박스"].checkbox === expected) {
          notionCorrect++
        } else {
          notionMismatch++
          console.log(
            `  Notion 불일치: ${rowId} expected=${expected}, notion=${fresh?.properties["체크박스"].checkbox}`,
          )
        }
      }
      console.log(`  Notion 일치: ${notionCorrect}/${expectedState.size}`)
      expect(notionMismatch).toBe(0)
    } finally {
      // --- Cleanup: 원래 값 복원 ---
      console.log(`\n=== Cleanup: ${originalValues.size} rows 복원 ===`)
      for (const [rowId, original] of originalValues) {
        const current = expectedState.get(rowId)
        if (current !== original) {
          await notion.pages.update({
            page_id: rowId,
            properties: { 체크박스: { checkbox: original } },
          }).catch(() => {})
          await sleep(400) // rate limit 보호
        }
      }
    }
  }, 300_000)
})
