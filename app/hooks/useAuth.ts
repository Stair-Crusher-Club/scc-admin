import { atom, useAtom } from "jotai"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { storage } from "@/lib/storage"

// * null은 초기화 되기 전 상태:storage에서 가져오기 전
export const authAtom = atom<string | null>(null)

export function useAuth() {
  const [token, setToken] = useAtom(authAtom)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    // TODO: token 유효성 검사. 지금은 일단 있으면 오케이.
    const authToken = storage.get("token")
    if (authToken) {
      setToken(authToken)
    } else {
      setToken(null)
      if (pathname !== "/account/login") {
        router.replace("/account/login?redirect=" + pathname)
      }
    }
  }, [setToken, pathname])

  // 토큰 업데이트 함수 (로그인)
  const updateToken = (token: string) => {
    storage.set("token", token)
    setToken(token)
  }

  // 토큰 제거 함수 (로그아웃)
  const clearToken = () => {
    storage.remove("token")
    setToken(null)
    router.replace("/account/login")
  }

  const isAuthenticated = token === null ? null : !!token

  return {
    isAuthenticated,
    updateToken,
    clearToken,
  }
}
