import { BasicModalProps } from "@reactleaf/modal"
import Lottie from "lottie-react"
import Image from "next/image"

import Close from "@/icons/Close"
import Download from "@/icons/Download"

import questCompletionStampAnimation from "../../../public/lottie/quest_completion_stamp.json"
import * as S from "./QuestCompletion.style"

export default function QuestGuide({ close }: BasicModalProps) {
  return (
    <S.ModalContainer>
      <S.ModalWrapper>
        <S.Modal>
          <S.CloseButtonWrapper onClick={close}>
            <Close size={24} color="#197AEC" />
          </S.CloseButtonWrapper>
          <div>
            <Image src="/quest_completion.png" width={196} height={68} alt="퀘스트 클리어 문구" />
            <S.QuestStampWrapper>
              <S.QuestStampLottie>
                <Lottie animationData={questCompletionStampAnimation} loop={false} autoPlay={true} />
              </S.QuestStampLottie>
              <Image src="/quest_completion_stamp_before.png" width={191} height={191} alt="퀘스트 스탬프" />
            </S.QuestStampWrapper>
          </div>
          <S.QuestInfoList>
            <S.QuestInfoItem>
              <h4>퀘스트 명</h4>
              <p>워밍업 #2 - K조</p>
            </S.QuestInfoItem>
            <S.QuestInfoItem>
              <h4>클리어 날짜</h4>
              <p>2025.03.29</p>
            </S.QuestInfoItem>
          </S.QuestInfoList>
          <Image src="/SCC_logo.png" width={109} height={17} alt="계단뿌셔클럽 로고" />
        </S.Modal>

        <S.ModalBackground>
          <Image src="/quest_completion_bg.png" width={375} height={372} alt="배경" />
        </S.ModalBackground>
      </S.ModalWrapper>

      <S.ImageDownloadButton>
        이미지 저장하기
        <Download size={16} color="white" />
      </S.ImageDownloadButton>
    </S.ModalContainer>
  )
}
