import { styled } from "@/styles/jsx"

export const RightSheet = styled("div", {
  base: {
    position: "absolute",
    right: 0,
    display: "flex",
    flexFlow: "column",
    height: "100%",
    borderTopLeftRadius: "1.6rem",
    borderBottomLeftRadius: "1.6rem",
    background: "white",
    overflow: "hidden",
    transition: "transform 0.2s ease-in-out",
    pointerEvents: "all",
    boxShadow: "0 0 0.8rem rgba(0, 0, 0, 0.2)",
  },
  variants: {
    visible: {
      true: {
        transform: "translateX(0)",
      },
      false: {
        transform: "translateX(100%)",
      },
    },
  },
})

export const RightSheetHeader = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: "0 0 4rem",
  },
})

export const SheetTitle = styled("h5", {
  base: {
    fontSize: "1.25rem",
    fontWeight: 700,
  },
})

export const CloseButton = styled("button", {
  base: {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    lineHeight: 0,
  },
})

export const ActionButtonWrapper = styled("div", {
  base: {
    position: "absolute",
    top: "1.4rem",
    right: "1.6rem",
    lineHeight: 0,
  },
})

export const RightSheetBody = styled("div", {
  base: {
    height: "100%",
    overflow: "auto",
  },
})
