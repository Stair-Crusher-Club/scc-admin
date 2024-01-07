import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    padding: "2rem",
  },
})

export const Event = styled("div", {
  base: {
    marginBottom: "1rem",
  },
})

export const EventName = styled("span", {
  base: {
    display: "inline-block",
    fontWeight: "bold",
    marginBottom: "0.25rem",
  },
})

export const Quests = styled("ul", {
  base: {
    display: "flex",
    "& li:not(:first-child)": {
      marginLeft: "-1px",
    },
  },
})
export const Quest = styled("li", {
  base: {
    padding: "0.25rem 0.5rem",
    border: "1px solid #eaeaea",
  },
})
