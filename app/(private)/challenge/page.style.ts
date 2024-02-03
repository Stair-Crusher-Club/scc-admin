import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    padding: "2rem",
  },
})

export const PageTitle = styled("h1", {
  base: {
    textStyle: "3xl",
    marginBottom: "2rem",
  },
})
export const PageAction = styled("button", {
  base: {
    padding: "0.25rem 1rem 0.4rem",
    marginLeft: "0.5rem",
    borderRadius: "4px",
    backgroundColor: "#1D85FF",
    color: "white",
    textStyle: "md",
    cursor: "pointer",
  },
})

export const Challenges = styled("ul", {
  base: {},
})
export const Challenge = styled("li", {
  base: {
    padding: "0.25rem 0.5rem",
    margin: "0.25rem 0",
    cursor: "pointer",
    _hover: {
      backgroundColor: "#f5f5f5",
    },
  },
})
