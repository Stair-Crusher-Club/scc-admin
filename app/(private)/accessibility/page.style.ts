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

export const SearchButton = styled("button", {
  base: {
    padding: "8px 16px",
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

export const TableWrapper = styled("div", {
  base: {
    padding: "20px 20px",
  },
})
export const AccessibilityTable = styled("table", {
  base: {
    tableLayout: "auto",
    width: "full",
  },
})

export const HeaderRow = styled("tr", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "white",
  },
})
export const HeaderCell = styled("th", {
  base: {
    padding: "8px 4px 12px",
    fontWeight: "bold",
  },
})
