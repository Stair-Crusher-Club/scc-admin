import { styled } from "@/styles/jsx"

export const Container = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    height: "calc(100vh - 60px)",
  },
})

export const Loading = styled("div", {
  base: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "full",
    height: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "gray.200",
  },
})

export const SummaryButton = styled("button", {
  base: {
    position: "absolute",
    zIndex: 10,
    bottom: 16,
    right: 16,
    padding: "8px 16px",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
  },
})
