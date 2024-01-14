import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {},
  variants: {
    size: {
      small: {
        height: "full",
      },
      large: {
        height: "full",
        padding: "2rem",
      },
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
    width: "full",
    height: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "gray.200",
  },
})
