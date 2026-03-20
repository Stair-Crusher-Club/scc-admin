import redis from "./redis"

/** In-memory request coalescing (인스턴스 내 동시 요청 중복 방지) */
const inFlight = new Map<string, Promise<unknown>>()

interface CachedValue<T> {
  data: T
  /** Logical expiry (epoch ms). Physical TTL in Redis is 2x this for stale-while-revalidate. */
  logicalExpiresAt: number
}

/**
 * Redis 캐시 + cache stampede 방지.
 *
 * - Fresh (logical TTL 내): 즉시 반환
 * - Stale (logical TTL 지남, physical TTL 내): stale 반환 + 1개 요청만 background refresh (SETNX lock)
 * - Miss: request coalescing 후 Notion API 호출
 * - Redis 장애 시: graceful degradation (캐시 없이 직접 호출)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 20,
): Promise<T> {
  // 1. Redis 캐시 확인
  const raw = await redis.get(key).catch(() => null)
  if (raw) {
    const cached: CachedValue<T> = JSON.parse(raw)
    const now = Date.now()

    if (now < cached.logicalExpiresAt) {
      return cached.data
    }

    // Stale — lock 시도하여 1개만 refresh
    const lockKey = `lock:${key}`
    const acquired = await redis
      .set(lockKey, "1", "EX", 10, "NX")
      .catch(() => null)

    if (!acquired) {
      // 다른 요청이 refresh 중 — stale 데이터 반환
      return cached.data
    }

    // Lock 획득 — background refresh, stale 먼저 반환
    refreshCache(key, fetcher, ttlSeconds, lockKey)
    return cached.data
  }

  // 2. Cache miss — request coalescing + fetch
  const existing = inFlight.get(key)
  if (existing) return existing as Promise<T>

  const promise = fetcher()
    .then(async (data) => {
      await setCache(key, data, ttlSeconds)
      inFlight.delete(key)
      return data
    })
    .catch((err) => {
      inFlight.delete(key)
      throw err
    })

  inFlight.set(key, promise)
  return promise
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number,
) {
  const value: CachedValue<T> = {
    data,
    logicalExpiresAt: Date.now() + ttlSeconds * 1000,
  }
  await redis
    .set(key, JSON.stringify(value), "EX", ttlSeconds * 2)
    .catch(() => {})
}

async function refreshCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
  lockKey: string,
) {
  try {
    const data = await fetcher()
    await setCache(key, data, ttlSeconds)
  } finally {
    await redis.del(lockKey).catch(() => {})
  }
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key).catch(() => {})
}

// --- DB Rows: 통짜 캐시 + Background Sync ---

function splitOnce(str: string, sep: string): [string, string] {
  const idx = str.indexOf(sep)
  if (idx === -1) return [str, ""]
  return [str.slice(0, idx), str.slice(idx + sep.length)]
}

/**
 * Per-key lock으로 read-modify-write 직렬화.
 * 동시 updateCachedRows가 같은 캐시 키를 GET → modify → SET하면 lost update 발생.
 * Promise chaining으로 같은 dbId에 대한 업데이트를 순차 실행.
 */
const updateChains = new Map<string, Promise<void>>()

/**
 * DB rows 캐시에서 특정 row의 property를 직접 수정.
 * 캐시 무효화가 아닌 수정이므로 다음 read에서 Notion API 호출 불필요.
 */
export async function updateCachedRows(
  dbId: string,
  rowId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const chainKey = `notion:db-rows:${dbId}`
  const prev = updateChains.get(chainKey) ?? Promise.resolve()
  const current = prev.then(() => doUpdateCachedRows(chainKey, rowId, properties))
  updateChains.set(chainKey, current.catch(() => {}))
  await current
}

async function doUpdateCachedRows(
  key: string,
  rowId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const raw = await redis.get(key).catch(() => null)
  if (!raw) return

  const cached: CachedValue<unknown[]> = JSON.parse(raw)
  cached.data = cached.data.map((row: any) => {
    if (row.id !== rowId) return row
    const updated = { ...row, properties: { ...row.properties } }
    for (const [name, value] of Object.entries(properties)) {
      updated.properties[name] = { ...updated.properties[name], ...(value as object) }
    }
    return updated
  })

  // 기존 TTL 유지하며 덮어쓰기
  const ttl = await redis.ttl(key)
  if (ttl > 0) {
    await redis.set(key, JSON.stringify(cached), "EX", ttl).catch(() => {})
  }
}

/**
 * Dirty flag 마킹 — sync가 우리 값을 덮어쓰지 않도록 보호.
 * HSET notion:writes:{dbId} "rowId:propName" "true"/"false"
 */
export async function markDirty(
  dbId: string,
  rowId: string,
  properties: Record<string, any>,
): Promise<void> {
  const key = `notion:writes:${dbId}`
  const entries: [string, string][] = []

  for (const [propName, value] of Object.entries(properties)) {
    if (value?.type === "checkbox" || value?.checkbox !== undefined) {
      const checkboxValue = value.checkbox ?? false
      entries.push([`${rowId}:${propName}`, String(checkboxValue)])
    }
  }

  if (entries.length > 0) {
    const flat = entries.flat()
    await redis.hset(key, ...flat).catch(() => {})
    // dirty flags도 만료되도록 (2분이면 충분)
    await redis.expire(key, 120).catch(() => {})
  }
}

/**
 * Background sync: Notion에서 fresh rows fetch → dirty-aware merge → Redis 갱신.
 * 10초에 1번, lock으로 중복 방지.
 */
export function triggerSyncIfNeeded(
  dbId: string,
  fetcher: () => Promise<unknown[]>,
): void {
  // Fire-and-forget — 호출자를 블로킹하지 않음
  doSync(dbId, fetcher).catch(() => {})
}

async function doSync(
  dbId: string,
  fetcher: () => Promise<unknown[]>,
): Promise<void> {
  const lastSync = await redis
    .get(`notion:last-sync:${dbId}`)
    .catch(() => null)
  if (lastSync && Date.now() - Number(lastSync) < 10_000) return

  const lockKey = `notion:sync-lock:${dbId}`
  const acquired = await redis
    .set(lockKey, "1", "EX", 30, "NX")
    .catch(() => null)
  if (!acquired) return

  try {
    // 1. Notion에서 fresh rows fetch
    const freshRows = await fetcher()

    // 2. Dirty 목록 확인
    const dirty = await redis
      .hgetall(`notion:writes:${dbId}`)
      .catch(() => ({}))

    // 3. Merge: dirty checkbox는 우리 값 유지
    const merged = freshRows.map((row: any) => {
      const result = { ...row, properties: { ...row.properties } }
      for (const [key, value] of Object.entries(dirty)) {
        const [rowId, propName] = splitOnce(key, ":")
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

    // 4. 캐시 저장 (60초 physical TTL)
    await setCache(`notion:db-rows:${dbId}`, merged, 60)
    await redis
      .set(`notion:last-sync:${dbId}`, String(Date.now()))
      .catch(() => {})

    // 5. Dirty cleanup: Notion 값 == 우리 값이면 보호 해제
    for (const [key, value] of Object.entries(dirty)) {
      const [rowId, propName] = splitOnce(key, ":")
      const notionRow = (freshRows as any[]).find((r) => r.id === rowId)
      if (
        notionRow?.properties[propName]?.checkbox === (value === "true")
      ) {
        await redis.hdel(`notion:writes:${dbId}`, key).catch(() => {})
      }
    }
  } finally {
    await redis.del(lockKey).catch(() => {})
  }
}
