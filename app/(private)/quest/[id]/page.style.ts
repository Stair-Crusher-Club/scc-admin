import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    display: "flex",
    height: "full",
  },
  variants: {
    size: {
      small: {},
      large: {},
    },
  },
})

export const Map = styled("div", {
  base: {
    width: "full",
    height: "full",
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
