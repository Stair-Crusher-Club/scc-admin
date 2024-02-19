import StorageAccessor from "@reactleaf/storage"

type StorageData = {
  token: string
  sawQuestGuide: string
}

export const storage = new StorageAccessor<StorageData>("@scc/")
