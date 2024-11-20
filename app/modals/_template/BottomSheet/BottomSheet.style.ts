import { styled } from "@/styles/jsx"

export const BottomSheet = styled("div", {
  base: {
    position: "absolute",
    bottom: 0,
    display: "flex",
    flexFlow: "column",
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    background: "white",
    overflow: "hidden",
    transition: "transform 0.2s ease-in-out",
    pointerEvents: "all",
    boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
  },
  variants: {
    visible: {
      true: {
        transform: "translateY(0)",
      },
      false: {
        transform: "translateY(100%)",
      },
    },
  },
})

export const BottomSheetHeader = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: "1 0 fit-content",
    minHeight: 64,
    padding: "8px 0",
  },
})

export const SheetTitle = styled("h5", {
  base: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 700,
    "& small": {
      display: "block",
      fontWeight: 400,
      fontSize: 14,
      lineHeight: 18 / 14,
    },
  },
})

export const CloseButton = styled("button", {
  base: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
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

export const BottomSheetBody = styled("div", {
  base: {
    height: "100%",
    paddingBottom: 48,
    overflow: "auto",
  },
})
