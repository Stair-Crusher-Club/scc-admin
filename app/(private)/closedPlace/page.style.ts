import { styled } from "@/styles/jsx"

export const Contents = styled("main", {
  base: {
    padding: 32,
  },
})

export const TableWrapper = styled("div", {
  base: {
    width: "100%",
    marginTop: "20px",
  },
})

export const RowWrapper = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #eee",
    gap: "10px",
  },
})

export const TextContent = styled("p", {
  base: {
    flex: 1,
    margin: 0,
  },
})

export const ExternalMap = styled("div", {
  base: {
    cursor: "pointer",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& img": {
      width: "24px",
      height: "24px",
    },
  },
})

export const LoadNextPageButton = styled("button", {
  base: {
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",

    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
})

export const TabContainer = styled("div", {
  base: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
})

export const Tab = styled("button", {
  base: {
    padding: "8px 16px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#666",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#0066cc",
    },
  },
  variants: {
    active: {
      true: {
        color: "#0066cc",
        borderBottom: "2px solid #0066cc",
      },
    },
  },
})
