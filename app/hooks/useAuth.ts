import { atom, useAtomValue, useSetAtom } from "jotai"
import { useEffect } from "react"

import { storage } from "@/lib/storage"

// * null은 초기화 되기 전 상태:storage에서 가져오기 전
export const authAtom = atom<string | null>(null)

export const initAuthAtom = atom(null, (_get, set) => {
  const token = storage.get("token")
  set(authAtom, token ?? null)
})

// TODO: token 유효성 검사. 지금은 일단 있으면 오케이.
export const isAuthenticatedAtom = atom((get) => {
  const token = get(authAtom)
  return get(authAtom) === null ? null : !!token
})

export const authWritableAtom = atom(
  (get) => get(authAtom),
  (_get, set, newToken: string | null) => {
    if (newToken) {
      storage.set("token", newToken)
    } else {
      storage.remove("token")
    }
    set(authAtom, newToken)
  },
)

export function useAuth() {
  const setInit = useSetAtom(initAuthAtom)
  const setAuth = useSetAtom(authWritableAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  useEffect(() => {
    setInit()
  }, [setInit])

  // 토큰 업데이트 함수 (로그인)
  const updateToken = (token: string) => {
    setAuth(token)
  }

  // 토큰 제거 함수 (로그아웃)
  const clearToken = () => {
    setAuth(null)
  }

  return {
    isAuthenticated,
    updateToken,
    clearToken,
  }
}
