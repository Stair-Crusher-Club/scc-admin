import { styled } from "@/styles/jsx"

export const Filters = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
})

export const Select = styled("select", {
  base: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "white",
  },
})

export const Input = styled("input", {
  base: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "white",
  },
})

export const Button = styled("button", {
  base: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },
})

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
  },
})

export const ImagesCell = styled("div", {
  base: {
    display: "table-cell",
    padding: "8px 12px",
    verticalAlign: "middle",
  },
})

export const ThumbGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "8px",
  },
})


