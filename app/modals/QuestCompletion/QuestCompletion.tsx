import Lottie from "lottie-react"
import { domToPng } from "modern-screenshot"
import Image from "next/image"
import { useRef } from "react"

import Close from "@/icons/Close"
import Download from "@/icons/Download"

import questCompletionStampAnimation from "../../../public/lottie/quest_completion_stamp.json"
import * as S from "./QuestCompletion.style"

export interface QuestCompletionProps {
  questName: string
  questClearDate: string
  close: () => void
}

export default function QuestCompletion({ close, questName, questClearDate }: QuestCompletionProps) {
  const captureRef = useRef<HTMLDivElement | null>(null)

  const handleCapture = async () => {
    if (captureRef.current) {
      const filter = (node: Node) => {
        if (node instanceof Element) {
          return node.id !== "quest-completion-modal-close-button"
        }
        return true
      }

      const dataUrl = await domToPng(captureRef.current, { scale: 2, filter })
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `${questClearDate.replaceAll(".", "")}_정복완료.png`
      link.click()
    }
  }

  return (
    <S.ModalContainer onClick={(e) => e.stopPropagation()}>
      <S.ModalWrapper ref={captureRef}>
        <S.Modal>
          <S.CloseButtonWrapper onClick={close} id="quest-completion-modal-close-button">
            <Close size={24} color="#197AEC" />
          </S.CloseButtonWrapper>
          <S.QuestClearWrapper>
            <Image src="/quest_completion.png" width={196} height={68} alt="퀘스트 클리어 문구" />
            <S.QuestStampWrapper>
              <S.QuestStampLottie>
                <Lottie animationData={questCompletionStampAnimation} loop={false} autoPlay={true} />
              </S.QuestStampLottie>
              <Image src="/quest_completion_stamp_before.png" width={225} height={225} alt="퀘스트 스탬프" />
            </S.QuestStampWrapper>
          </S.QuestClearWrapper>
          <S.QuestInfoList>
            <S.QuestInfoItem>
              <h4>퀘스트 명</h4>
              <p>{questName}</p>
            </S.QuestInfoItem>
            <S.QuestInfoItem>
              <h4>클리어 날짜</h4>
              <p>{questClearDate}</p>
            </S.QuestInfoItem>
          </S.QuestInfoList>
          <Image src="/SCC_logo.png" width={109} height={17} alt="계단뿌셔클럽 로고" />
        </S.Modal>

        <S.ModalBackground>
          <Image priority={true} src="/quest_completion_bg.png" width={375} height={372} alt="배경" />
        </S.ModalBackground>
      </S.ModalWrapper>

      <S.ImageDownloadButton onClick={handleCapture}>
        이미지 저장하기
        <Download size={16} color="white" />
      </S.ImageDownloadButton>
    </S.ModalContainer>
  )
}
