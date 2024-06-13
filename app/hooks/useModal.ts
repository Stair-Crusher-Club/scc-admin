import { createModalHook } from "@reactleaf/modal"

import register from "@/modals/register"
import {OpenModalPayload} from "@reactleaf/modal/dist/types";
import {ModalContextType} from "@reactleaf/modal/dist/context";
import {useRef} from "react";

// Android back button을 눌렀을 때 이전 페이지로 가는 것이 아니라 modal close로 취급하기 위한 custom hook.
// 기본적으로는 modal open = 새로운 페이지로 이동하는 것과 같이 취급하는 것이 목적이다.
// - modal open 시 history.pushState()
// - modal close 시 history.back()
// - back button 시 modal close (by handling popstate event)
//
// 위의 전략은 기본적으로 잘 동작하지만, 한 함수에서 modal을 닫자마자 다른 modal을 바로 여는 케이스에서는 올바르게 동작하지 않는다.
// 이는 history.back()이 asynchronous하게 동작하기 때문이다.
// - 기대하는 순서 - modal close -> history.back() -> modal open -> history.pushState()
// - 실제 발생하는 순서 - modal close -> modal open -> history.pushState() -> (추후 비동기적으로) history.back()
//   -> modal이 닫혀버린다.
// 이러한 문제를 막기 위해, modal close ~ history.back() 사이에 modal open 요청이 오면 이를 저장해뒀다가 history.back() 이후의 콜백으로 실행한다.
const originalUseModal = createModalHook<typeof register>()
export const useModal: () => ModalContextType<typeof register> = () => {
  // modal close ~ history.back() 사이에 modal open 요청이 오면 이를 저장해뒀다가 history.back() 이후의 콜백으로 실행하기 위한 ref들.
  const isModalClosingRef = useRef<boolean>(false)
  const pendingModalOpenRef = useRef<() => void>()
  const originalOnCloseRef = useRef<() => void>()
  function doOriginalOnCloseAndClear() {
    if (originalOnCloseRef.current) {
      originalOnCloseRef.current()
      originalOnCloseRef.current = undefined
    }
  }

  const {
    openedModals,
    defaultOverlayOptions,
    openModal,
    closeModal,
    closeAll,
    closeSelf,
  } = originalUseModal()

  const newOpenModal = (payload: OpenModalPayload<typeof register, keyof typeof register>) => {
    function doOpenModal() {
      const originalOnClose = payload?.events?.onClose
      const modalId = openModal({
        ...payload,
        events: {
          ...payload.events,
          onClose: () => {
            if (originalOnClose) {
              originalOnClose()
            }
            onModalClose()
          }
        }
      })
      originalOnCloseRef.current = originalOnClose
      onModalOpen()
      return modalId
    }

    if (isModalClosingRef.current) {
      pendingModalOpenRef.current = doOpenModal
    } else {
      doOpenModal()
    }

    // openModal()이 delay 될 수 있으므로, modalId를 모르는 경우가 생길 수 있다.
    // 그래서 openModal()시에는 그냥 무의미한 id를 건내주고, closeModal()은 closeAll()을 해준다.
    return 'modal'
  }

  const newCloseModal = (payload: { id: string }) => {
    // openModal()이 delay 될 수 있으므로, modalId를 모르는 경우가 생길 수 있다.
    // 그래서 openModal()시에는 그냥 무의미한 id를 건내주고, closeModal()은 closeAll()을 해준다.
    closeAll()
    doOriginalOnCloseAndClear()
    onModalClose()
  }

  const newCloseAll = () => {
    closeAll()
    doOriginalOnCloseAndClear()
    onModalClose()
  }

  const newCloseSelf = () => {
    closeSelf()
    doOriginalOnCloseAndClear()
    onModalClose()
  }

  function onModalOpen() {
    history.pushState({ isModalOpen: true }, '', window.location.pathname)
    window.addEventListener("popstate", handlePopstate)
  }

  function onModalClose() {
    onModalCloseStarted()
    if (history.state.isModalOpen) {
      history.back()
    } else {
      onModalCloseFinished()
    }
  }

  function handlePopstate(event: PopStateEvent) {
    event.preventDefault()
    if (!history.state.isModalOpen) {
      closeAll()
      doOriginalOnCloseAndClear()
      onModalCloseFinished()
    }
  }

  function onModalCloseStarted() {
    isModalClosingRef.current = true
  }

  function onModalCloseFinished() {
    isModalClosingRef.current = false
    window.removeEventListener("popstate", handlePopstate)

    if (pendingModalOpenRef.current) {
      pendingModalOpenRef.current()
      pendingModalOpenRef.current = undefined
    }
  }

  return {
    openedModals,
    defaultOverlayOptions,
    closeModal: newCloseModal,
    closeAll: newCloseAll,
    closeSelf: newCloseSelf,
    openModal: newOpenModal,
  }
}
