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

export const BuildingInfo = styled("div", {
  base: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
})

export const BuildingName = styled("p", {
  base: {
    margin: 0,
    fontWeight: 600,
    fontSize: "14px",
  },
})

export const BuildingAddress = styled("p", {
  base: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
  },
})

export const BuildingIds = styled("p", {
  base: {
    margin: 0,
    fontSize: "11px",
    color: "#999",
    fontFamily: "monospace",
  },
})

export const LocationInfo = styled("div", {
  base: {
    fontSize: "11px",
    color: "#999",
    fontFamily: "monospace",
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
