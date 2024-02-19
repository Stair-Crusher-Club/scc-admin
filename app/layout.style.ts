import { styled } from "@/styles/jsx"

export const Layout = styled("div", {
  base: {
    display: "flex",
    width: "full",
    height: "full",
  },
})

export const Body = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    width: "full",
    overflow: "scroll",
  },
})
