import { styled } from "@/styles/jsx"

export const TableWrapper = styled("div", {
  base: {
    padding: "0 20px",
    marginBottom: 64,
  },
})
export const PlaceTable = styled("table", {
  base: {
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

export const Cell = styled("td", {
  base: {
    padding: "8px 4px",
    textAlign: "center",
    lineHeight: 0,
  },
})
