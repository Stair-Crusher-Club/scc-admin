import { styled } from "@/styles/jsx"

export const Contents = styled("main", {
  base: {
    padding: 32,
  },
})

export const Event = styled("div", {
  base: {
    marginBottom: 16,
  },
})

export const EventName = styled("span", {
  base: {
    display: "inline-block",
    fontWeight: "bold",
    marginBottom: 4,
  },
})

export const ShareButton = styled("button", {
  base: {
    padding: "2px 4px",
    marginLeft: 4,
    borderRadius: 4,
    border: "1px solid #1D85FF",
    color: "#1D85FF",
    fontSize: 12,
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
    padding: "4px 8px",
    border: "1px solid #eaeaea",
  },
})
