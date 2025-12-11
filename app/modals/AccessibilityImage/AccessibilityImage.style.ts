import { styled } from "@/styles/jsx"

export const Container = styled("div", {
  base: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 9999,
    cursor: "pointer",
  },
})

export const AccessibilityImage = styled("img", {
  base: {
    maxWidth: "95vw",
    maxHeight: "95vh",
    objectFit: "contain",
    cursor: "default",
  },
})