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

export const ShareButton = styled("button", {
  base: {
    padding: "0.125rem 0.25rem",
    marginLeft: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #1D85FF",
    color: "#1D85FF",
    fontSize: "0.75rem",
    cursor: "pointer",
    fontWeight: "normal",
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
