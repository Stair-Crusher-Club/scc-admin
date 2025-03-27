import { styled } from "@/styles/jsx"

export const ModalContainer = styled("div", {
  base: {
    width: "full",
    maxWidth: "375px",
    display: "flex",
    flexDir: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 16px",
    gap: "14px",
  },
})

export const ModalWrapper = styled("div", {
  base: {
    width: "full",
    background: "#D6EBFF",
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden",
  },
})

export const Modal = styled("div", {
  base: {
    width: "full",
    display: "flex",
    flexDir: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    gap: "14px",
    padding: "30px 16px 16px 16px",
    zIndex: 2,
  },
})

export const ModalBackground = styled("div", {
  base: {
    position: "absolute",
    width: "full",
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
})

export const CloseButtonWrapper = styled("button", {
  base: {
    position: "absolute",
    top: "16px",
    right: "16px",
  },
})

export const QuestStampWrapper = styled("div", {
  base: {
    position: "relative",
  },
})

export const QuestStampLottie = styled("div", {
  base: {
    width: "full",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
})

export const QuestInfoList = styled("ul", {
  base: {
    width: "full",
    listStyle: "none",
    background: "white",
    borderRadius: "12px",
    padding: "12px",
    display: "flex",
    flexDir: "column",
    gap: "12px",
  },
})

export const QuestInfoItem = styled("li", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    "& h4": {
      fontSize: "14px",
      color: "#86929C",
    },
    "& p": {
      fontWeight: "600",
    },
  },
})

export const ImageDownloadButton = styled("button", {
  base: {
    width: "full",
    padding: "16px",
    background: "#0C76F7",
    color: "white",
    borderRadius: 12,
    fontWeight: "600",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
  },
})
