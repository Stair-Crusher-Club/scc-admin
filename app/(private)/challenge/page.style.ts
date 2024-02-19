import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    padding: 32,
  },
})

export const PageTitle = styled("h1", {
  base: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
  },
})
export const PageAction = styled("button", {
  base: {
    padding: "4px 16px",
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: "#1D85FF",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
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
