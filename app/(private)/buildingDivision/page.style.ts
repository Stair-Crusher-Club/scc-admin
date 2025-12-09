import { styled } from "@/styles/jsx"

export const Header = styled("div", {
  base: {
    marginBottom: "24px",
  },
})

export const Title = styled("h1", {
  base: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
})

export const Description = styled("p", {
  base: {
    fontSize: "14px",
    color: "gray.600",
  },
})

export const FilterContainer = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
})

export const FilterButton = styled("button", {
  base: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: "gray.300",
    backgroundColor: "white",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    _hover: {
      backgroundColor: "gray.50",
    },
  },
  variants: {
    active: {
      true: {
        backgroundColor: "blue.500",
        borderColor: "blue.500",
        color: "white",
        _hover: {
          backgroundColor: "blue.600",
        },
      },
    },
  },
})

export const TableWrapper = styled("div", {
  base: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "gray.200",
    overflow: "hidden",
  },
})

export const EmptyMessage = styled("p", {
  base: {
    padding: "32px",
    textAlign: "center",
    color: "gray.500",
  },
})

export const Table = styled("table", {
  base: {
    width: "100%",
    borderCollapse: "collapse",
  },
})

export const TableHeader = styled("thead", {
  base: {
    backgroundColor: "gray.50",
  },
})

export const TableBody = styled("tbody", {
  base: {},
})

export const TableRow = styled("tr", {
  base: {
    borderBottom: "1px solid",
    borderColor: "gray.200",
    _last: {
      borderBottom: "none",
    },
  },
  variants: {
    clickable: {
      true: {
        cursor: "pointer",
        _hover: {
          backgroundColor: "gray.50",
        },
      },
    },
  },
})

export const TableHeaderCell = styled("th", {
  base: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    color: "gray.700",
  },
})

export const TableCell = styled("td", {
  base: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "gray.900",
  },
})

export const LoadMoreButton = styled("button", {
  base: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    backgroundColor: "white",
    border: "1px solid",
    borderColor: "gray.300",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    _hover: {
      backgroundColor: "gray.50",
    },
  },
})
