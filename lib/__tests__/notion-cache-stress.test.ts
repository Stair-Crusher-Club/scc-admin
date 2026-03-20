import { describe, it, expect, vi, beforeEach } from "vitest"

// --- In-memory Redis mock with realistic latency ---
let store: Map<string, string>
let expiry: Map<string, number>
let hashStore: Map<string, Map<string, string>>

/** 실제 Redis 네트워크 지연 시뮬레이션 (0.1~0.5ms) */
function redisDelay(): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.random() * 0.4 + 0.1))
}

function isExpired(key: string): boolean {
  const exp = expiry.get(key)
  if (!exp) return false
  return Date.now() > exp
}

const redisMock = {
  get: vi.fn(async (key: string) => {
    await redisDelay()
    if (isExpired(key)) {
      store.delete(key)
      expiry.delete(key)
      return null
    }
    return store.get(key) ?? null
  }),
  set: vi.fn(async (key: string, value: string, ...args: any[]) => {
    await redisDelay()
    const exIdx = args.indexOf("EX")
    const nxIdx = args.indexOf("NX")
    if (nxIdx !== -1 && store.has(key) && !isExpired(key)) return null
    store.set(key, value)
    if (exIdx !== -1) {
      const ttl = args[exIdx + 1] as number
      expiry.set(key, Date.now() + ttl * 1000)
    }
    return "OK"
  }),
  del: vi.fn(async (key: string) => {
    await redisDelay()
    store.delete(key)
    expiry.delete(key)
    return 1
  }),
  ttl: vi.fn(async (key: string) => {
    await redisDelay()
    const exp = expiry.get(key)
    if (!exp) return -1
    const remaining = Math.ceil((exp - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }),
  hset: vi.fn(async (key: string, ...args: any[]) => {
    await redisDelay()
    if (!hashStore.has(key)) hashStore.set(key, new Map())
    const h = hashStore.get(key)!
    for (let i = 0; i < args.length; i += 2) {
      h.set(args[i], args[i + 1])
    }
    return args.length / 2
  }),
  hgetall: vi.fn(async (key: string) => {
    await redisDelay()
    const h = hashStore.get(key)
    if (!h) return {}
    return Object.fromEntries(h)
  }),
  hdel: vi.fn(async (key: string, field: string) => {
    await redisDelay()
    const h = hashStore.get(key)
    if (!h) return 0
    const existed = h.delete(field)
    return existed ? 1 : 0
  }),
  expire: vi.fn(async (key: string, seconds: number) => {
    await redisDelay()
    expiry.set(key, Date.now() + seconds * 1000)
    return 1
  }),
}

vi.mock("../redis", () => ({ default: redisMock }))

const {
  cachedFetch,
  setCache,
  updateCachedRows,
  markDirty,
  triggerSyncIfNeeded,
} = await import("../notion-cache")

// --- Helpers ---

function makeRow(id: string, props: Record<string, any> = {}) {
  return {
    id,
    properties: {
      이름: { type: "title", title: [{ plain_text: `User ${id}` }] },
      조: { type: "number", number: 1 },
      ...props,
    },
  }
}

function makeCheckboxProp(checked: boolean) {
  return { type: "checkbox", checkbox: checked }
}

function makeCachedValue(data: any, ttlSeconds: number = 60) {
  return { data, logicalExpiresAt: Date.now() + ttlSeconds * 1000 }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

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
  throughput: number // ops/sec
  errors: number
  errorRate: string
}

function computeStats(latencies: number[], durationMs: number, errors: number): Stats {
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
    throughput: Math.round((sorted.length / durationMs) * 1000),
    errors,
    errorRate: `${((errors / (sorted.length + errors)) * 100).toFixed(1)}%`,
  }
}

function printStats(label: string, stats: Stats) {
  console.log(`\n=== ${label} ===`)
  console.log(`  ops: ${stats.count}, errors: ${stats.errors} (${stats.errorRate})`)
  console.log(
    `  latency (ms): min=${stats.min.toFixed(2)}, p50=${stats.p50.toFixed(2)}, p95=${stats.p95.toFixed(2)}, p99=${stats.p99.toFixed(2)}, max=${stats.max.toFixed(2)}`,
  )
  console.log(`  mean=${stats.mean.toFixed(2)}ms, throughput=${stats.throughput} ops/s`)
}

// --- Stress Tests ---

beforeEach(() => {
  store = new Map()
  expiry = new Map()
  hashStore = new Map()
  vi.clearAllMocks()
})

describe("스트레스 테스트 — latency & throughput", () => {
  it("60명 동시 read (cache hit) — p95 < 5ms", async () => {
    const DB_ID = "stress-read"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`
    const CONCURRENT = 60

    // 30 rows 캐시 세팅
    const rows = Array.from({ length: 30 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(i % 2 === 0) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    const latencies: number[] = []
    let errors = 0
    const start = performance.now()

    await Promise.all(
      Array.from({ length: CONCURRENT }, async () => {
        const t0 = performance.now()
        try {
          const raw = await redisMock.get(CACHE_KEY)
          JSON.parse(raw!)
        } catch {
          errors++
        }
        latencies.push(performance.now() - t0)
      }),
    )

    const duration = performance.now() - start
    const stats = computeStats(latencies, duration, errors)
    printStats("60명 동시 read (cache hit)", stats)

    expect(stats.errors).toBe(0)
    expect(stats.p95).toBeLessThan(5)
  })

  it("60명 sustained read — 3초간 폴링 (5초 간격 시뮬)", async () => {
    const DB_ID = "stress-sustained-read"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = Array.from({ length: 30 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    const latencies: number[] = []
    let errors = 0
    const DURATION_MS = 3000
    const BATCH_SIZE = 60
    const BATCH_INTERVAL = 500 // 500ms마다 60명 동시 요청

    const testStart = performance.now()

    while (performance.now() - testStart < DURATION_MS) {
      await Promise.all(
        Array.from({ length: BATCH_SIZE }, async () => {
          const t0 = performance.now()
          try {
            const raw = await redisMock.get(CACHE_KEY)
            JSON.parse(raw!)
          } catch {
            errors++
          }
          latencies.push(performance.now() - t0)
        }),
      )
      await sleep(BATCH_INTERVAL)
    }

    const duration = performance.now() - testStart
    const stats = computeStats(latencies, duration, errors)
    printStats("60명 sustained read (3초간)", stats)

    expect(stats.errorRate).toBe("0.0%")
    // mock Redis delay(0.1~0.5ms) + 60 concurrent → p95 ~6ms
    // 실제 Redis에서는 sub-ms
    expect(stats.p95).toBeLessThan(10)
  })

  it("30명 동시 write (markDirty + updateCachedRows) — p95 < 150ms", async () => {
    const DB_ID = "stress-write"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`
    const CONCURRENT = 30

    const rows = Array.from({ length: CONCURRENT }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    const latencies: number[] = []
    let errors = 0
    const start = performance.now()

    await Promise.all(
      Array.from({ length: CONCURRENT }, async (_, i) => {
        const t0 = performance.now()
        try {
          await markDirty(DB_ID, `row-${i}`, {
            출석: { type: "checkbox", checkbox: true },
          })
          await updateCachedRows(DB_ID, `row-${i}`, {
            출석: { type: "checkbox", checkbox: true },
          })
        } catch {
          errors++
        }
        latencies.push(performance.now() - t0)
      }),
    )

    const duration = performance.now() - start
    const stats = computeStats(latencies, duration, errors)
    printStats("30명 동시 write (markDirty + updateCache)", stats)

    // 정합성 검증
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    let correctCount = 0
    for (let i = 0; i < CONCURRENT; i++) {
      if (cached.data[i].properties.출석.checkbox === true) correctCount++
    }

    console.log(`  정합성: ${correctCount}/${CONCURRENT} rows correctly updated`)
    expect(correctCount).toBe(CONCURRENT)
    expect(stats.errors).toBe(0)
    // Per-key lock 직렬화 + mock Redis delay(0.1~0.5ms * 3 ops/write * 30 writes)
    // 실제 Redis(sub-ms)에서는 훨씬 빠르지만, mock에서는 누적됨
    // 30명 직렬화 기준 worst case ≈ 30 * 3ops * 0.5ms = 45ms → 마진 포함 150ms
    expect(stats.p95).toBeLessThan(150)
  })

  it("mixed workload — 60 read + 10 write 동시 (이벤트 현장 시뮬)", async () => {
    const DB_ID = "stress-mixed"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`
    const READERS = 60
    const WRITERS = 10

    const rows = Array.from({ length: 30 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    const readLatencies: number[] = []
    const writeLatencies: number[] = []
    let readErrors = 0
    let writeErrors = 0

    const start = performance.now()

    const readPromises = Array.from({ length: READERS }, async () => {
      const t0 = performance.now()
      try {
        const raw = await redisMock.get(CACHE_KEY)
        JSON.parse(raw!)
      } catch {
        readErrors++
      }
      readLatencies.push(performance.now() - t0)
    })

    const writePromises = Array.from({ length: WRITERS }, async (_, i) => {
      const t0 = performance.now()
      try {
        await markDirty(DB_ID, `row-${i}`, {
          출석: { type: "checkbox", checkbox: true },
        })
        await updateCachedRows(DB_ID, `row-${i}`, {
          출석: { type: "checkbox", checkbox: true },
        })
      } catch {
        writeErrors++
      }
      writeLatencies.push(performance.now() - t0)
    })

    await Promise.all([...readPromises, ...writePromises])
    const duration = performance.now() - start

    const readStats = computeStats(readLatencies, duration, readErrors)
    const writeStats = computeStats(writeLatencies, duration, writeErrors)
    printStats("mixed read (60 concurrent)", readStats)
    printStats("mixed write (10 concurrent)", writeStats)

    expect(readStats.errors).toBe(0)
    expect(writeStats.errors).toBe(0)
    expect(readStats.p95).toBeLessThan(10)
    expect(writeStats.p95).toBeLessThan(50)
  })

  it("write burst — 2초간 연속 write 스파이크", async () => {
    const DB_ID = "stress-burst"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = Array.from({ length: 60 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    const latencies: number[] = []
    let errors = 0
    const DURATION_MS = 2000
    const BATCH_SIZE = 10 // 10명씩 동시 write
    const BATCH_INTERVAL = 200 // 200ms마다 burst

    const testStart = performance.now()
    let batchIdx = 0

    while (performance.now() - testStart < DURATION_MS) {
      const batchStart = batchIdx * BATCH_SIZE
      await Promise.all(
        Array.from({ length: BATCH_SIZE }, async (_, i) => {
          const rowIdx = (batchStart + i) % 60
          const t0 = performance.now()
          try {
            await markDirty(DB_ID, `row-${rowIdx}`, {
              출석: { type: "checkbox", checkbox: true },
            })
            await updateCachedRows(DB_ID, `row-${rowIdx}`, {
              출석: { type: "checkbox", checkbox: true },
            })
          } catch {
            errors++
          }
          latencies.push(performance.now() - t0)
        }),
      )
      batchIdx++
      await sleep(BATCH_INTERVAL)
    }

    const duration = performance.now() - testStart
    const stats = computeStats(latencies, duration, errors)
    printStats("write burst (2초, 10명/200ms)", stats)

    // 최종 캐시 정합성
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    const trueCount = cached.data.filter(
      (r: any) => r.properties.출석.checkbox === true,
    ).length
    console.log(`  최종 정합성: ${trueCount}/60 rows = true`)

    expect(stats.errorRate).toBe("0.0%")
    expect(stats.p95).toBeLessThan(100)
  })

  it("background sync 중 write → dirty 보호 + 응답 지연 없음", async () => {
    const DB_ID = "stress-sync-write"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = Array.from({ length: 20 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // Slow sync fetcher (50ms — Notion API 시뮬레이션)
    const notionRows = Array.from({ length: 20 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    const fetcher = vi.fn(async () => {
      await sleep(50)
      return notionRows
    })

    // sync 시작
    store.delete(`notion:last-sync:${DB_ID}`)
    triggerSyncIfNeeded(DB_ID, fetcher)

    // sync 진행 중에 write 10개 발생
    const writeLatencies: number[] = []
    let writeErrors = 0

    await Promise.all(
      Array.from({ length: 10 }, async (_, i) => {
        const t0 = performance.now()
        try {
          await markDirty(DB_ID, `row-${i}`, {
            출석: { type: "checkbox", checkbox: true },
          })
          await updateCachedRows(DB_ID, `row-${i}`, {
            출석: { type: "checkbox", checkbox: true },
          })
        } catch {
          writeErrors++
        }
        writeLatencies.push(performance.now() - t0)
      }),
    )

    const writeStats = computeStats(writeLatencies, writeLatencies.reduce((a, b) => a + b, 0), writeErrors)
    printStats("sync 중 write (10 concurrent)", writeStats)

    // sync 완료 대기
    await sleep(200)

    // dirty flag 덕분에 write한 row들은 true 유지
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    let protectedCount = 0
    for (let i = 0; i < 10; i++) {
      if (cached.data[i].properties.출석.checkbox === true) protectedCount++
    }
    console.log(`  dirty 보호: ${protectedCount}/10 rows protected after sync`)

    expect(writeErrors).toBe(0)
    expect(protectedCount).toBe(10)
    // write가 sync에 blocked되지 않았는지 확인 (mock delay 포함 50ms)
    expect(writeStats.p95).toBeLessThan(50)
  })

  it("rapid toggle 부하 — 같은 row 100회 토글", async () => {
    const DB_ID = "stress-toggle"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = [makeRow("row-0", { 출석: makeCheckboxProp(false) })]
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    const TOGGLES = 100
    const latencies: number[] = []
    let errors = 0
    const start = performance.now()

    for (let i = 0; i < TOGGLES; i++) {
      const checked = i % 2 === 0
      const t0 = performance.now()
      try {
        await markDirty(DB_ID, "row-0", {
          출석: { type: "checkbox", checkbox: checked },
        })
        await updateCachedRows(DB_ID, "row-0", {
          출석: { type: "checkbox", checkbox: checked },
        })
      } catch {
        errors++
      }
      latencies.push(performance.now() - t0)
    }

    const duration = performance.now() - start
    const stats = computeStats(latencies, duration, errors)
    printStats(`rapid toggle ${TOGGLES}회`, stats)

    // 최종 상태: i=99 → i%2=1 → false
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    expect(cached.data[0].properties.출석.checkbox).toBe(false)
    expect(stats.errors).toBe(0)
  })

  it("cachedFetch cache miss → 60명 동시 요청 (thundering herd)", async () => {
    const CONCURRENT = 60
    let fetchCount = 0
    const fetcher = vi.fn(async () => {
      fetchCount++
      await sleep(20) // Notion API delay
      return Array.from({ length: 30 }, (_, i) => makeRow(`row-${i}`))
    })

    const latencies: number[] = []
    let errors = 0
    const start = performance.now()

    // 첫 번째 요청으로 inFlight 등록
    const first = (async () => {
      const t0 = performance.now()
      try {
        await cachedFetch("thundering:key", fetcher, 60)
      } catch {
        errors++
      }
      latencies.push(performance.now() - t0)
    })()

    // 약간의 딜레이 후 나머지 59명
    await sleep(1)
    const rest = Array.from({ length: CONCURRENT - 1 }, async () => {
      const t0 = performance.now()
      try {
        await cachedFetch("thundering:key", fetcher, 60)
      } catch {
        errors++
      }
      latencies.push(performance.now() - t0)
    })

    await Promise.all([first, ...rest])
    const duration = performance.now() - start
    const stats = computeStats(latencies, duration, errors)
    printStats("thundering herd (60명 cache miss)", stats)

    console.log(`  Notion API calls: ${fetchCount} (should be 1)`)
    expect(fetchCount).toBe(1)
    expect(stats.errors).toBe(0)
  })
})
