import { styled } from "@/styles/jsx"

export const RightSheet = styled("div", {
  base: {
    position: "absolute",
    right: 0,
    display: "flex",
    flexFlow: "column",
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    background: "white",
    overflow: "hidden",
    transition: "transform 0.2s ease-in-out",
    pointerEvents: "all",
    boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
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
    flex: "0 0 64px",
  },
})

export const SheetTitle = styled("h5", {
  base: {
    fontSize: 20,
    fontWeight: 700,
  },
})

export const CloseButton = styled("button", {
  base: {
    position: "absolute",
    top: 16,
    left: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    lineHeight: 0,
  },
})

export const ActionButtonWrapper = styled("div", {
  base: {
    position: "absolute",
    top: 14,
    right: 16,
    lineHeight: 0,
  },
})

export const RightSheetBody = styled("div", {
  base: {
    height: "100%",
    overflow: "auto",
  },
})
