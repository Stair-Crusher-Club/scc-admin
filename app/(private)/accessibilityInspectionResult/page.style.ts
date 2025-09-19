import { styled } from "@/styles/jsx"

export const FiltersContainer = styled("div", {
  base: {
    padding: "16px 20px",
    background: "white",
    borderBottom: "1px solid #eee",
  },
})

export const Filters = styled("div", {
  base: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
    flexWrap: "wrap",
    rowGap: "12px",
  },
})

export const FilterLabel = styled("label", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    minWidth: "120px",
  },
})

export const Select = styled("select", {
  base: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    fontSize: "14px",
    minWidth: "100px",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
    "&:focus": {
      outline: "none",
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.1)",
    },
    "&:hover": {
      borderColor: "#bbb",
    },
  },
})

export const Input = styled("input", {
  base: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    fontSize: "14px",
    minWidth: "140px",
    transition: "border-color 0.2s ease",
    "&:focus": {
      outline: "none",
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.1)",
    },
    "&:hover": {
      borderColor: "#bbb",
    },
  },
})

export const Button = styled("button", {
  base: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    transition: "all 0.2s ease",
    minWidth: "80px",
    "&:hover": {
      background: "#f8f9fa",
      borderColor: "#bbb",
    },
    "&:active": {
      transform: "translateY(1px)",
    },
  },
})

export const ReinspectionButton = styled("button", {
  base: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #007bff",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    minWidth: "100px",
    transition: "all 0.2s ease",
    "&:hover:not(:disabled)": {
      background: "#0056b3",
      borderColor: "#0056b3",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
    },
    "&:active:not(:disabled)": {
      transform: "translateY(0)",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none",
    },
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
    "& > div:nth-child(2)": {
      width: "15%",
    },
    "& > div:nth-child(5)": {
      width: "20%",
    },
    "& > div:nth-child(6)": {
      width: "30%",
    },
  },
})

export const RowWrapper = styled("div", {
  base: {
    display: "table-row",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    width: "100%",
    "& > div:nth-child(1)": {
      width: "30%",
    },
    "& > div:nth-child(2)": {
      width: "10%",
    },
    "& > div:nth-child(5)": {
      width: "20%",
    },
    "& > div:nth-child(6)": {
      width: "30%",
    },
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


