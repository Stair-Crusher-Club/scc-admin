import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// --- In-memory Redis mock ---
let store: Map<string, string>
let expiry: Map<string, number>
let hashStore: Map<string, Map<string, string>>

function isExpired(key: string): boolean {
  const exp = expiry.get(key)
  if (!exp) return false
  return Date.now() > exp
}

const redisMock = {
  get: vi.fn(async (key: string) => {
    if (isExpired(key)) {
      store.delete(key)
      expiry.delete(key)
      return null
    }
    return store.get(key) ?? null
  }),
  set: vi.fn(async (key: string, value: string, ...args: any[]) => {
    // Handle SET key value EX ttl NX
    const exIdx = args.indexOf("EX")
    const nxIdx = args.indexOf("NX")

    if (nxIdx !== -1) {
      // NX: only set if not exists
      if (store.has(key) && !isExpired(key)) return null
    }

    store.set(key, value)
    if (exIdx !== -1) {
      const ttl = args[exIdx + 1] as number
      expiry.set(key, Date.now() + ttl * 1000)
    }
    return "OK"
  }),
  del: vi.fn(async (key: string) => {
    store.delete(key)
    expiry.delete(key)
    return 1
  }),
  ttl: vi.fn(async (key: string) => {
    const exp = expiry.get(key)
    if (!exp) return -1
    const remaining = Math.ceil((exp - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }),
  hset: vi.fn(async (key: string, ...args: any[]) => {
    if (!hashStore.has(key)) hashStore.set(key, new Map())
    const h = hashStore.get(key)!
    for (let i = 0; i < args.length; i += 2) {
      h.set(args[i], args[i + 1])
    }
    return args.length / 2
  }),
  hgetall: vi.fn(async (key: string) => {
    const h = hashStore.get(key)
    if (!h) return {}
    return Object.fromEntries(h)
  }),
  hdel: vi.fn(async (key: string, field: string) => {
    const h = hashStore.get(key)
    if (!h) return 0
    const existed = h.delete(field)
    return existed ? 1 : 0
  }),
  expire: vi.fn(async (key: string, seconds: number) => {
    // For hash keys, track expiry in the same map
    expiry.set(key, Date.now() + seconds * 1000)
    return 1
  }),
}

vi.mock("../redis", () => ({ default: redisMock }))

// Import after mock
const {
  cachedFetch,
  setCache,
  invalidateCache,
  updateCachedRows,
  markDirty,
  triggerSyncIfNeeded,
} = await import("../notion-cache")

// --- Test helpers ---

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
  return {
    data,
    logicalExpiresAt: Date.now() + ttlSeconds * 1000,
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// --- Tests ---

beforeEach(() => {
  store = new Map()
  expiry = new Map()
  hashStore = new Map()
  vi.clearAllMocks()
})

describe("cachedFetch", () => {
  it("cache miss → fetcher 호출 → 캐시 저장", async () => {
    const fetcher = vi.fn().mockResolvedValue([1, 2, 3])
    const result = await cachedFetch("test:key", fetcher, 30)

    expect(result).toEqual([1, 2, 3])
    expect(fetcher).toHaveBeenCalledOnce()
    expect(store.has("test:key")).toBe(true)

    const cached = JSON.parse(store.get("test:key")!)
    expect(cached.data).toEqual([1, 2, 3])
  })

  it("cache hit (fresh) → fetcher 호출 안 함", async () => {
    store.set("test:key", JSON.stringify(makeCachedValue("cached-data", 60)))
    expiry.set("test:key", Date.now() + 120_000)

    const fetcher = vi.fn().mockResolvedValue("new-data")
    const result = await cachedFetch("test:key", fetcher, 60)

    expect(result).toBe("cached-data")
    expect(fetcher).not.toHaveBeenCalled()
  })

  it("cache stale → stale 반환 + background refresh", async () => {
    // logicalExpiresAt이 이미 지남
    const stale = { data: "stale-data", logicalExpiresAt: Date.now() - 1000 }
    store.set("test:key", JSON.stringify(stale))
    expiry.set("test:key", Date.now() + 60_000) // physical TTL은 아직 살아있음

    const fetcher = vi.fn().mockResolvedValue("fresh-data")
    const result = await cachedFetch("test:key", fetcher, 30)

    // Stale 데이터 즉시 반환
    expect(result).toBe("stale-data")
    // Background refresh 시작됨
    expect(fetcher).toHaveBeenCalledOnce()

    // Refresh 완료 대기
    await sleep(50)
    const refreshed = JSON.parse(store.get("test:key")!)
    expect(refreshed.data).toBe("fresh-data")
  })

  it("request coalescing — 동시 요청 시 fetcher 1번만 호출", async () => {
    let resolvePromise: (v: string) => void
    const fetcher = vi.fn(
      () => new Promise<string>((r) => (resolvePromise = r)),
    )

    // 첫 호출 시작 — redis.get이 비동기이므로 event loop yield 필요
    const p1 = cachedFetch("coalesce:key", fetcher, 30)
    // redis.get → null → fetcher() 호출 → inFlight에 등록되기까지 대기
    await sleep(10)

    const p2 = cachedFetch("coalesce:key", fetcher, 30)
    const p3 = cachedFetch("coalesce:key", fetcher, 30)

    resolvePromise!("shared-result")

    const [r1, r2, r3] = await Promise.all([p1, p2, p3])
    expect(r1).toBe("shared-result")
    expect(r2).toBe("shared-result")
    expect(r3).toBe("shared-result")
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it("Redis 장애 시 graceful degradation — fetcher 직접 호출", async () => {
    redisMock.get.mockRejectedValueOnce(new Error("Redis down"))

    const fetcher = vi.fn().mockResolvedValue("direct-result")
    const result = await cachedFetch("fail:key", fetcher, 30)

    expect(result).toBe("direct-result")
  })
})

describe("setCache / invalidateCache", () => {
  it("setCache → physical TTL은 logical의 2배", async () => {
    await setCache("sc:key", { hello: "world" }, 30)

    const raw = JSON.parse(store.get("sc:key")!)
    expect(raw.data).toEqual({ hello: "world" })
    // logicalExpiresAt ≈ now + 30s
    expect(raw.logicalExpiresAt).toBeGreaterThan(Date.now() + 29_000)
    expect(raw.logicalExpiresAt).toBeLessThan(Date.now() + 31_000)
    // physical TTL = 60s (EX 60)
    expect(redisMock.set).toHaveBeenCalledWith(
      "sc:key",
      expect.any(String),
      "EX",
      60,
    )
  })

  it("invalidateCache → 키 삭제", async () => {
    store.set("del:key", "value")
    await invalidateCache("del:key")
    expect(store.has("del:key")).toBe(false)
  })
})

describe("updateCachedRows", () => {
  const DB_ID = "test-db-1"
  const CACHE_KEY = `notion:db-rows:${DB_ID}`

  it("캐시된 row의 checkbox property를 직접 수정", async () => {
    const rows = [
      makeRow("row-1", { 출석: makeCheckboxProp(false) }),
      makeRow("row-2", { 출석: makeCheckboxProp(false) }),
    ]
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    expiry.set(CACHE_KEY, Date.now() + 60_000)

    await updateCachedRows(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
    })

    const updated = JSON.parse(store.get(CACHE_KEY)!)
    expect(updated.data[0].properties.출석.checkbox).toBe(true)
    expect(updated.data[1].properties.출석.checkbox).toBe(false) // 다른 row는 그대로
  })

  it("존재하지 않는 rowId → 아무 변경 없음", async () => {
    const rows = [makeRow("row-1", { 출석: makeCheckboxProp(false) })]
    const original = JSON.stringify(makeCachedValue(rows))
    store.set(CACHE_KEY, original)
    expiry.set(CACHE_KEY, Date.now() + 60_000)

    await updateCachedRows(DB_ID, "non-existent", {
      출석: { type: "checkbox", checkbox: true },
    })

    const after = JSON.parse(store.get(CACHE_KEY)!)
    expect(after.data[0].properties.출석.checkbox).toBe(false)
  })

  it("캐시 miss 시 → 아무것도 안 함 (에러 없음)", async () => {
    await expect(
      updateCachedRows(DB_ID, "row-1", {
        출석: { type: "checkbox", checkbox: true },
      }),
    ).resolves.toBeUndefined()
  })

  it("TTL이 만료된 캐시 → 덮어쓰지 않음", async () => {
    const rows = [makeRow("row-1", { 출석: makeCheckboxProp(false) })]
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    // TTL 만료 시뮬레이션: ttl mock이 -2 반환
    redisMock.ttl.mockResolvedValueOnce(-2)

    await updateCachedRows(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
    })

    // ttl <= 0이면 set 호출 안 함
    const setCalls = redisMock.set.mock.calls.filter(
      (c: any[]) => c[0] === CACHE_KEY,
    )
    expect(setCalls).toHaveLength(0)
  })
})

describe("markDirty", () => {
  const DB_ID = "test-db-2"
  const HASH_KEY = `notion:writes:${DB_ID}`

  it("checkbox property → dirty flag 마킹", async () => {
    await markDirty(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
    })

    const h = hashStore.get(HASH_KEY)!
    expect(h.get("row-1:출석")).toBe("true")
  })

  it("checkbox false → dirty flag 'false'", async () => {
    await markDirty(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: false },
    })

    const h = hashStore.get(HASH_KEY)!
    expect(h.get("row-1:출석")).toBe("false")
  })

  it("non-checkbox property → dirty flag 안 남김", async () => {
    await markDirty(DB_ID, "row-1", {
      이름: { type: "title", title: [{ plain_text: "New Name" }] },
    })

    expect(hashStore.has(HASH_KEY)).toBe(false)
  })

  it("여러 checkbox를 동시에 마킹", async () => {
    await markDirty(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
      간식: { type: "checkbox", checkbox: false },
    })

    const h = hashStore.get(HASH_KEY)!
    expect(h.get("row-1:출석")).toBe("true")
    expect(h.get("row-1:간식")).toBe("false")
  })

  it("expire 120초 설정됨", async () => {
    await markDirty(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
    })

    expect(redisMock.expire).toHaveBeenCalledWith(HASH_KEY, 120)
  })
})

describe("triggerSyncIfNeeded — background sync", () => {
  const DB_ID = "sync-db-1"

  it("lastSync 없으면 → sync 실행", async () => {
    const freshRows = [
      makeRow("row-1", { 출석: makeCheckboxProp(true) }),
    ]
    const fetcher = vi.fn().mockResolvedValue(freshRows)

    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    expect(fetcher).toHaveBeenCalledOnce()
    // 캐시에 저장됨
    const cached = JSON.parse(store.get(`notion:db-rows:${DB_ID}`)!)
    expect(cached.data).toHaveLength(1)
    // last-sync 기록됨
    expect(store.has(`notion:last-sync:${DB_ID}`)).toBe(true)
  })

  it("lastSync < 10초 → sync 안 함", async () => {
    store.set(`notion:last-sync:${DB_ID}`, String(Date.now()))

    const fetcher = vi.fn().mockResolvedValue([])
    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(50)

    expect(fetcher).not.toHaveBeenCalled()
  })

  it("lastSync > 10초 → sync 실행", async () => {
    store.set(`notion:last-sync:${DB_ID}`, String(Date.now() - 11_000))

    const fetcher = vi.fn().mockResolvedValue([makeRow("row-1")])
    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    expect(fetcher).toHaveBeenCalledOnce()
  })

  it("lock 이미 잡혀있으면 → sync 안 함 (중복 방지)", async () => {
    store.set(`notion:last-sync:${DB_ID}`, String(Date.now() - 20_000))
    store.set(`notion:sync-lock:${DB_ID}`, "1")
    expiry.set(`notion:sync-lock:${DB_ID}`, Date.now() + 30_000)

    const fetcher = vi.fn().mockResolvedValue([])
    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(50)

    expect(fetcher).not.toHaveBeenCalled()
  })

  it("sync 완료 후 lock 해제됨", async () => {
    const fetcher = vi.fn().mockResolvedValue([makeRow("row-1")])
    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    expect(store.has(`notion:sync-lock:${DB_ID}`)).toBe(false)
  })

  it("fetcher 실패 시에도 lock 해제됨", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Notion 429"))
    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    expect(store.has(`notion:sync-lock:${DB_ID}`)).toBe(false)
  })
})

describe("dirty-aware merge (sync가 dirty checkbox를 보호)", () => {
  const DB_ID = "dirty-db-1"

  it("dirty flag가 있으면 Notion 값 대신 dirty 값 유지", async () => {
    // PATCH로 row-1:출석 = true로 변경했지만
    // Notion에서는 아직 false인 상태 (sync 시점에 반영 안 됨)
    hashStore.set(
      `notion:writes:${DB_ID}`,
      new Map([["row-1:출석", "true"]]),
    )

    const notionRows = [
      makeRow("row-1", { 출석: makeCheckboxProp(false) }), // Notion은 아직 false
      makeRow("row-2", { 출석: makeCheckboxProp(false) }),
    ]
    const fetcher = vi.fn().mockResolvedValue(notionRows)

    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    const cached = JSON.parse(store.get(`notion:db-rows:${DB_ID}`)!)
    // row-1: dirty 값(true) 유지
    expect(cached.data[0].properties.출석.checkbox).toBe(true)
    // row-2: Notion 값(false) 그대로
    expect(cached.data[1].properties.출석.checkbox).toBe(false)
  })

  it("Notion 값 == dirty 값이면 dirty flag 해제", async () => {
    // Notion에 이미 반영 완료
    hashStore.set(
      `notion:writes:${DB_ID}`,
      new Map([["row-1:출석", "true"]]),
    )

    const notionRows = [
      makeRow("row-1", { 출석: makeCheckboxProp(true) }), // Notion도 true
    ]
    const fetcher = vi.fn().mockResolvedValue(notionRows)

    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    // Dirty flag 해제됨
    const h = hashStore.get(`notion:writes:${DB_ID}`)
    expect(h?.has("row-1:출석")).toBeFalsy()
  })

  it("Notion 값 != dirty 값이면 dirty flag 유지", async () => {
    hashStore.set(
      `notion:writes:${DB_ID}`,
      new Map([["row-1:출석", "true"]]),
    )

    const notionRows = [
      makeRow("row-1", { 출석: makeCheckboxProp(false) }), // 아직 불일치
    ]
    const fetcher = vi.fn().mockResolvedValue(notionRows)

    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    const h = hashStore.get(`notion:writes:${DB_ID}`)
    expect(h?.get("row-1:출석")).toBe("true") // 유지
  })
})

describe("동시성 테스트", () => {
  it("동시 PATCH 10개 → 모두 캐시에 정확히 반영", async () => {
    const DB_ID = "concurrent-db"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    // 10명의 row, 모두 출석=false
    const rows = Array.from({ length: 10 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // 10명 동시에 출석 체크
    await Promise.all(
      rows.map((row) =>
        updateCachedRows(DB_ID, row.id, {
          출석: { type: "checkbox", checkbox: true },
        }),
      ),
    )

    const cached = JSON.parse(store.get(CACHE_KEY)!)
    // 모든 row가 true로 변경됨
    for (let i = 0; i < 10; i++) {
      expect(cached.data[i].properties.출석.checkbox).toBe(true)
    }
  })

  it("PATCH + sync 동시 발생 시 dirty flag가 보호", async () => {
    const DB_ID = "race-db"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    // 초기 캐시
    const initialRows = [
      makeRow("row-1", { 출석: makeCheckboxProp(false) }),
    ]
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(initialRows)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // 1. PATCH: row-1:출석 = true
    await markDirty(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
    })
    await updateCachedRows(DB_ID, "row-1", {
      출석: { type: "checkbox", checkbox: true },
    })

    // 2. Sync: Notion에서 old data (false) 가져옴
    store.delete(`notion:last-sync:${DB_ID}`) // sync 허용
    const staleNotionRows = [
      makeRow("row-1", { 출석: makeCheckboxProp(false) }),
    ]
    const fetcher = vi.fn().mockResolvedValue(staleNotionRows)

    triggerSyncIfNeeded(DB_ID, fetcher)
    await sleep(100)

    // dirty flag 덕분에 true 유지
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    expect(cached.data[0].properties.출석.checkbox).toBe(true)
  })

  it("여러 sync 동시 trigger → lock 덕분에 1개만 실행", async () => {
    const DB_ID = "multi-sync-db"
    let fetchCount = 0
    const fetcher = vi.fn(async () => {
      fetchCount++
      await sleep(50) // 느린 Notion API 시뮬레이션
      return [makeRow("row-1")]
    })

    // 여러 sync 동시 trigger
    for (let i = 0; i < 5; i++) {
      triggerSyncIfNeeded(DB_ID, fetcher)
    }
    await sleep(200)

    // Lock 덕분에 1번만 실행
    expect(fetchCount).toBe(1)
  })
})

describe("스트레스 테스트", () => {
  it("60명 동시 read (cache hit) → 모두 동일한 데이터 반환", async () => {
    const DB_ID = "stress-read-db"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = Array.from({ length: 30 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(i % 2 === 0) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // 60명 동시 read
    const results = await Promise.all(
      Array.from({ length: 60 }, () =>
        redisMock.get(CACHE_KEY).then((raw: string | null) => {
          if (!raw) throw new Error("Cache miss unexpected")
          return JSON.parse(raw).data
        }),
      ),
    )

    // 모두 동일한 결과
    for (const result of results) {
      expect(result).toHaveLength(30)
      expect(result[0].properties.출석.checkbox).toBe(true)
      expect(result[1].properties.출석.checkbox).toBe(false)
    }
  })

  it("30명 동시 write → 모든 dirty flag 정확히 기록", async () => {
    const DB_ID = "stress-write-db"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = Array.from({ length: 30 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // 30명 동시 write (각각 자기 row를 true로)
    await Promise.all(
      rows.map(async (row) => {
        await markDirty(DB_ID, row.id, {
          출석: { type: "checkbox", checkbox: true },
        })
        await updateCachedRows(DB_ID, row.id, {
          출석: { type: "checkbox", checkbox: true },
        })
      }),
    )

    // 모든 dirty flag 존재
    const h = hashStore.get(`notion:writes:${DB_ID}`)!
    expect(h.size).toBe(30)
    for (let i = 0; i < 30; i++) {
      expect(h.get(`row-${i}:출석`)).toBe("true")
    }

    // 캐시에도 모두 반영
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    for (let i = 0; i < 30; i++) {
      expect(cached.data[i].properties.출석.checkbox).toBe(true)
    }
  })

  it("write + read + sync 혼합 시나리오 (이벤트 시뮬레이션)", async () => {
    const DB_ID = "event-sim-db"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    // 초기 상태: 20명 모두 미출석
    const rows = Array.from({ length: 20 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows, 60)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // Phase 1: 짝수 row 10명 출석 체크 (동시)
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => {
        const rowId = `row-${i * 2}`
        return Promise.all([
          markDirty(DB_ID, rowId, {
            출석: { type: "checkbox", checkbox: true },
          }),
          updateCachedRows(DB_ID, rowId, {
            출석: { type: "checkbox", checkbox: true },
          }),
        ])
      }),
    )

    // Phase 2: sync 발생 — Notion에서는 아직 모두 false
    const staleNotionRows = Array.from({ length: 20 }, (_, i) =>
      makeRow(`row-${i}`, { 출석: makeCheckboxProp(false) }),
    )
    store.delete(`notion:last-sync:${DB_ID}`)
    triggerSyncIfNeeded(DB_ID, vi.fn().mockResolvedValue(staleNotionRows))
    await sleep(100)

    // 검증: dirty flag 덕분에 짝수 row는 true 유지
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    for (let i = 0; i < 20; i++) {
      const expected = i % 2 === 0
      expect(cached.data[i].properties.출석.checkbox).toBe(expected)
    }

    // Phase 3: 홀수 row 10명도 출석 체크
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => {
        const rowId = `row-${i * 2 + 1}`
        return Promise.all([
          markDirty(DB_ID, rowId, {
            출석: { type: "checkbox", checkbox: true },
          }),
          updateCachedRows(DB_ID, rowId, {
            출석: { type: "checkbox", checkbox: true },
          }),
        ])
      }),
    )

    // 최종 검증: 모든 20명 true
    const final = JSON.parse(store.get(CACHE_KEY)!)
    for (let i = 0; i < 20; i++) {
      expect(final.data[i].properties.출석.checkbox).toBe(true)
    }
  })

  it("rapid toggle (같은 row를 빠르게 on/off) → 최종 상태 정확", async () => {
    const DB_ID = "toggle-db"
    const CACHE_KEY = `notion:db-rows:${DB_ID}`

    const rows = [makeRow("row-1", { 출석: makeCheckboxProp(false) })]
    store.set(CACHE_KEY, JSON.stringify(makeCachedValue(rows)))
    expiry.set(CACHE_KEY, Date.now() + 120_000)

    // 빠르게 10번 토글 (false → true → false → ...)
    for (let i = 0; i < 10; i++) {
      const checked = i % 2 === 0 // 0,2,4,6,8 = true / 1,3,5,7,9 = false
      await markDirty(DB_ID, "row-1", {
        출석: { type: "checkbox", checkbox: checked },
      })
      await updateCachedRows(DB_ID, "row-1", {
        출석: { type: "checkbox", checkbox: checked },
      })
    }

    // 마지막 toggle은 i=9 → false
    const cached = JSON.parse(store.get(CACHE_KEY)!)
    expect(cached.data[0].properties.출석.checkbox).toBe(false)

    const h = hashStore.get(`notion:writes:${DB_ID}`)!
    expect(h.get("row-1:출석")).toBe("false")
  })
})

describe("edge cases", () => {
  it("Redis 전체 장애 시 updateCachedRows 에러 없이 종료", async () => {
    redisMock.get.mockRejectedValueOnce(new Error("Connection refused"))

    await expect(
      updateCachedRows("db", "row", { 출석: makeCheckboxProp(true) }),
    ).resolves.toBeUndefined()
  })

  it("Redis 전체 장애 시 markDirty 에러 없이 종료", async () => {
    redisMock.hset.mockRejectedValueOnce(new Error("Connection refused"))

    await expect(
      markDirty("db", "row", { 출석: { type: "checkbox", checkbox: true } }),
    ).resolves.toBeUndefined()
  })

  it("빈 properties로 markDirty → 아무것도 안 함", async () => {
    await markDirty("db", "row", {})
    expect(redisMock.hset).not.toHaveBeenCalled()
  })

  it("property에 checkbox 필드가 undefined → skip", async () => {
    await markDirty("db", "row", {
      이름: { type: "title", title: [] },
    })
    expect(redisMock.hset).not.toHaveBeenCalled()
  })
})
