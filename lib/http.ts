import returnFetch, { FetchArgs } from "return-fetch"

import { storage } from "./storage"

export const http = returnFetch({
  baseUrl: "https://api.staircrusher.club/",
  headers: { "Content-Type": "application/json" },
  interceptors: {
    request: async ([url, config]: FetchArgs) => {
      config = config || {}

      // 로그인 요청에는 Authorization 헤더를 설정하지 않는다.
      if (`${url}`.includes("/login")) {
        return [url, config]
      }
      const token = storage.get("token")
      if (!token) return [url, config]

      const newHeaders = new Headers(config.headers)
      newHeaders.set("Authorization", `Bearer ${token}`)

      const newConfig: RequestInit = { ...config, headers: newHeaders }
      return [url, newConfig]
    },
  },
})
