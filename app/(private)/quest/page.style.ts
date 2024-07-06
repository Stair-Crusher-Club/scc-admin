import { styled } from "@/styles/jsx"

export const Contents = styled("main", {
  base: {
    padding: 32,
  },
})

export const QuestRow = styled("div", {
  base: {
    marginBottom: 16,
  },
})

export const QuestHeader = styled("span", {
  base: {
    display: "inline-block",
    fontWeight: "bold",
    marginBottom: 4,
  },
})

export const CreatedAt = styled("span", {
  base: {
    marginLeft: 8,
  },
})

const Button = styled("button", {
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

export const ShareButton = styled(Button, {
  base: {
    borderColor: "#1D85FF",
    color: "#1D85FF",
  },
})

export const DeleteButton = styled(Button, {
  base: {
    borderColor: "var(--leaf-status-red)",
    color: "var(--leaf-status-red)",
  },
})

export const LoadNextPageButton = styled("button", {
  base: {
    padding: 8,
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "var(--leaf-grey-80)",
      cursor: "not-allowed",
    },
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
