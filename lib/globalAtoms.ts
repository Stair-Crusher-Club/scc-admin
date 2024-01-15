import { atom } from "jotai"

interface AppStateType {
  isSidebarOpened: boolean
  isHeaderHidden: boolean
  headerTitle?: string
}
export const AppState = atom<AppStateType>({ isSidebarOpened: false, isHeaderHidden: false, headerTitle: "" })
