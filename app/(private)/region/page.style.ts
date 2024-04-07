import { styled } from "@/styles/jsx"

export const Map = styled("div", {
  base: {
    width: "full",
    height: "full",
  },
})

export const ListButton = styled("button", {
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

export const Loading = styled("div", {
  base: {
    position: "absolute",
    zIndex: 100,
    top: "0",
    left: "0",
    width: "full",
    height: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.3)",
    color: "white",
  },
})
