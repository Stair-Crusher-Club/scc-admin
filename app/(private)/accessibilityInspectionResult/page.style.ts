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

export const ResultsContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "20px",
    flex: 1,
    minHeight: 0,
  },
})

export const LoadingMessage = styled("div", {
  base: {
    textAlign: "center",
    padding: "40px",
    fontSize: "16px",
    color: "#666",
  },
})

export const EmptyMessage = styled("div", {
  base: {
    textAlign: "center",
    padding: "40px",
    fontSize: "16px",
    color: "#666",
  },
})

// Legacy table styles - kept for potential future use
// export const TableHeader = styled("div", {
//   base: {
//     display: "table-row",
//     fontWeight: 600,
//     background: "#f8f9fa",
//     borderBottom: "2px solid #eee",
//     minHeight: 40,
//     alignItems: "center",
//     width: "100%",
//     "& > div:nth-child(1)": {
//       width: "20%",
//     },
//     "& > div:nth-child(2)": {
//       width: "12%",
//     },
//     "& > div:nth-child(3)": {
//       width: "10%",
//     },
//     "& > div:nth-child(4)": {
//       width: "8%",
//     },
//     "& > div:nth-child(5)": {
//       width: "20%",
//     },
//     "& > div:nth-child(6)": {
//       width: "20%",
//     },
//     "& > div:nth-child(7)": {
//       width: "10%",
//     },
//   },
// })

// export const RowWrapper = styled("div", {
//   base: {
//     display: "table-row",
//     alignItems: "center",
//     borderBottom: "1px solid #eee",
//     width: "100%",
//     "& > div:nth-child(1)": {
//       width: "20%",
//     },
//     "& > div:nth-child(2)": {
//       width: "12%",
//     },
//     "& > div:nth-child(3)": {
//       width: "10%",
//     },
//     "& > div:nth-child(4)": {
//       width: "8%",
//     },
//     "& > div:nth-child(5)": {
//       width: "20%",
//     },
//     "& > div:nth-child(6)": {
//       width: "20%",
//     },
//     "& > div:nth-child(7)": {
//       width: "10%",
//     },
//   },
// })

// export const HeaderCell = styled("div", {
//   base: {
//     display: "table-cell",
//     padding: "8px 12px",
//     textAlign: "left",
//     verticalAlign: "middle",
//     wordBreak: "break-all",
//   },
// })

// export const Cell = styled("div", {
//   base: {
//     display: "table-cell",
//     padding: "8px 12px",
//     minHeight: 40,
//     verticalAlign: "middle",
//     wordBreak: "break-all",
//   },
// })

// export const ImagesCell = styled("div", {
//   base: {
//     display: "table-cell",
//     padding: "8px 12px",
//     verticalAlign: "middle",
//   },
// })

export const ThumbGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "8px",
  },
})

export const LoadImagesButton = styled("button", {
  base: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    background: "#f8f9ff",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#007bff",
      color: "white",
    },
  },
})

export const ExpandButton = styled("button", {
  base: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #007bff",
    background: "white",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    width: "100%",
    "&:hover": {
      background: "#007bff",
      color: "white",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
})

// Legacy expanded row styles - replaced with card-based design
// export const ExpandedRow = styled("div", {
//   base: {
//     display: "table-row",
//     width: "100%",
//     "& > div": {
//       width: "100%",
//     },
//   },
// })

// export const ExpandedContent = styled("div", {
//   base: {
//     display: "table-cell",
//     padding: "16px",
//     background: "#f8f9fa",
//     borderTop: "1px solid #dee2e6",
//     verticalAlign: "top",
//     width: "100%",
//     columnSpan: "7",
//   },
// })

export const DetailSection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
})

export const DetailTitle = styled("h3", {
  base: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    borderBottom: "2px solid #007bff",
    paddingBottom: "8px",
  },
})

export const DetailItem = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#555",
  },
})

export const CodeList = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "4px",
  },
})

export const CodeItem = styled("span", {
  base: {
    padding: "4px 8px",
    borderRadius: "4px",
    background: "#e9ecef",
    color: "#495057",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #ced4da",
  },
})

export const ImageDetailsList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
  },
})

export const ImageDetailItem = styled("div", {
  base: {
    padding: "12px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
})

export const ImageDetailUrl = styled("div", {
  base: {
    fontSize: "12px",
    color: "#6c757d",
    fontFamily: "monospace",
    wordBreak: "break-all",
    padding: "4px 8px",
    background: "#f8f9fa",
    borderRadius: "4px",
  },
})

export const ResultCard = styled("div", {
  base: {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-1px)",
    },
  },
})

export const CardHeader = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
  },
})

export const CardTitle = styled("h3", {
  base: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
})

export const CardStatus = styled("span", {
  base: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  variants: {
    isPassed: {
      true: {
        background: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
      },
      false: {
        background: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
      },
    },
  },
})

export const CardContent = styled("div", {
  base: {
    padding: "20px",
  },
})

export const InfoGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
})

export const InfoItem = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
})

export const InfoLabel = styled("span", {
  base: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
})

export const InfoValue = styled("span", {
  base: {
    fontSize: "14px",
    color: "#333",
    wordBreak: "break-word",
  },
})

export const ImageSection = styled("div", {
  base: {
    marginBottom: "20px",
  },
})

export const ImageSectionTitle = styled("h4", {
  base: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
})

export const NoImagesText = styled("span", {
  base: {
    fontSize: "14px",
    color: "#6c757d",
    fontStyle: "italic",
  },
})

export const ExpandedDetails = styled("div", {
  base: {
    background: "#f8f9fa",
    borderTop: "1px solid #e9ecef",
    padding: "20px",
  },
})

export const DetailLabel = styled("span", {
  base: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "8px",
    display: "block",
  },
})

export const DetailValue = styled("span", {
  base: {
    fontSize: "14px",
    color: "#6c757d",
    fontFamily: "monospace",
  },
})

export const PaginationContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginTop: "24px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
  },
})

export const PaginationInfo = styled("div", {
  base: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },
})

export const PaginationControls = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
})

export const PaginationButton = styled("button", {
  base: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "1px solid #007bff",
    background: "white",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    minWidth: "100px",
    "&:hover:not(:disabled)": {
      background: "#007bff",
      color: "white",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
    },
    "&:active:not(:disabled)": {
      transform: "translateY(0)",
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    },
  },
})

// Removed PaginationNumbers and PaginationNumber styles as they're no longer needed


