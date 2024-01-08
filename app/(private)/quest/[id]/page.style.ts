import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {},
  variants: {
    size: {
      small: {
        height: "full",
      },
      large: {
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
