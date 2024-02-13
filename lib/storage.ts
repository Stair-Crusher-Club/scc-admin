import StorageAccessor from "@reactleaf/storage"

type StorageData = {
  token: string
}

export const storage = new StorageAccessor<StorageData>("@scc/")
