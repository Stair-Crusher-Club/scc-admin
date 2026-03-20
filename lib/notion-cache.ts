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

async function setCache<T>(key: string, data: T, ttlSeconds: number) {
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

// --- Write Rate Limiter ---
// Notion API rate limit: ~3 req/s (reads + writes 공유)
// Reads는 캐시로 ~1 req/s → writes에 ~2 req/s 할당

const WRITE_CONCURRENCY = 2
const WRITE_MIN_INTERVAL_MS = 500 // 최소 500ms 간격 (= 2 req/s)
let activeWrites = 0
let lastWriteTime = 0
const writeQueue: Array<{
  execute: () => Promise<unknown>
  resolve: (v: unknown) => void
  reject: (e: unknown) => void
}> = []

async function processWriteQueue() {
  while (writeQueue.length > 0 && activeWrites < WRITE_CONCURRENCY) {
    const timeSinceLast = Date.now() - lastWriteTime
    if (timeSinceLast < WRITE_MIN_INTERVAL_MS) {
      setTimeout(processWriteQueue, WRITE_MIN_INTERVAL_MS - timeSinceLast)
      return
    }

    const item = writeQueue.shift()!
    activeWrites++
    lastWriteTime = Date.now()

    item
      .execute()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        activeWrites--
        processWriteQueue()
      })
  }
}

/**
 * Notion API write 호출을 rate limit하여 실행.
 * 동시 최대 2개, 500ms 간격으로 제한.
 * 큐에 대기 → 순서대로 처리.
 */
export function rateLimitedWrite<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    writeQueue.push({
      execute: fn as () => Promise<unknown>,
      resolve: resolve as (v: unknown) => void,
      reject,
    })
    processWriteQueue()
  })
}
