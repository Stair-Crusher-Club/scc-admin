import { styled } from "@/styles/jsx"

export const Contents = styled("main", {
  base: {
    padding: 32,
  },
})

export const Challenges = styled("ul", {
  base: {},
})
export const Challenge = styled("li", {
  base: {
    padding: "4px 8px",
    margin: "4px 0",
    cursor: "pointer",
    _hover: {
      backgroundColor: "#f5f5f5",
    },
  },
})
