import { styled } from "@/styles/jsx"

export const TableWrapper = styled("div", {
  base: {
    width: "100%",
    display: "table",
    tableLayout: "fixed",
    borderCollapse: "collapse",
    marginTop: "20px",
    flex: 1,
    minHeight: 0,
  },
})

// Table header row
export const TableHeader = styled("div", {
  base: {
    display: "table-row",
    fontWeight: 600,
    background: "#f8f9fa",
    borderBottom: "2px solid #eee",
    minHeight: 40,
    alignItems: "center",
    width: "100%",
  },
})

export const RowWrapper = styled("div", {
  base: {
    display: "table-row",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    width: "100%",
  },
})

export const HeaderCell = styled("div", {
  base: {
    display: "table-cell",
    padding: "8px 12px",
    textAlign: "left",
    width: "33.33%",
    verticalAlign: "middle",
    wordBreak: "break-all",
  },
})

export const Cell = styled("div", {
  base: {
    display: "table-cell",
    padding: "8px 12px",
    minHeight: 40,
    verticalAlign: "middle",
    wordBreak: "break-all",
    width: "33.33%",
  },
})

export const DeleteButton = styled("button", {
  base: {
    background: "#fff0f0",
    color: "#d32f2f",
    border: "1px solid #d32f2f",
    borderRadius: "4px",
    padding: "6px 14px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
    transition: "background 0.2s, color 0.2s",
    "&:hover": {
      background: "#d32f2f",
      color: "#fff",
    },
  },
})
