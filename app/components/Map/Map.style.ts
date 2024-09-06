import { styled } from "@/styles/jsx"

export const Map = styled("div", {
  base: {
    width: "full",
    height: "full",
    "& .radius": {
      backgroundColor: "white",
      padding: "2px 4px",
      fontWeight: 600,
    },
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
