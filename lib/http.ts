import globalAxios from "axios"
import returnFetch from "return-fetch"

import { storage } from "./storage"

export class NetworkError extends Error {
  response: Response

  constructor(response: Response) {
    super(response.statusText)
    this.name = "NetworkError"
    this.response = response
  }
}

export const internal = returnFetch({
  baseUrl: typeof window === "undefined" ? "" : location.origin,
})

globalAxios.interceptors.request.use(
  (config) => {
    // Skip adding Authorization header for login requests
    if (config.url?.includes("/login")) {
      return config
    }

    // Skip adding Authorization header if credentials are omitted
    if (config.withCredentials === false) {
      return config
    }

    const token = storage.get("token")
    if (!token) {
      return config
    }

    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

globalAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove("token")
      history.pushState(null, "", "/account/login?redirect=" + window.location.pathname)
    }
    return Promise.reject(error)
  },
)
