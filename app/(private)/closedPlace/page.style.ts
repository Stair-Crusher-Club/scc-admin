import { styled } from "@/styles/jsx"

export const Contents = styled("main", {
  base: {
    padding: 32,
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

export const ExternalMap = styled("button", {
  base: {
    width: "20px",
    height: "20px",
    border: "1px solid #ccc",
    verticalAlign: "middle",
    marginLeft: 4,
    cursor: "pointer",
  },
})

export const TableWrapper = styled("div", {
  base: {
    padding: "20px 20px",
  },
})

export const RowWrapper = styled("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})
