import returnFetch, { FetchArgs } from "return-fetch"

import { storage } from "./storage"

export class NetworkError extends Error {
  response: Response

  constructor(response: Response) {
    super(response.statusText)
    this.name = "NetworkError"
    this.response = response
  }
}

const isLive = process.env.NEXT_PUBLIC_DEPLOY_TYPE === "live"
export const http = returnFetch({
  baseUrl: isLive ? "https://api.staircrusher.club/" : "https://api.dev.staircrusher.club/",
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
    response: async (response) => {
      if (response.status >= 400) {
        throw new NetworkError(response)
      }
      return response
    },
  },
})
