import { styled } from "@/styles/jsx"

export const InputTitle = styled("span", {
  base: {
    fontSize: "1rem",
    textWrap: "nowrap",
    margin: "0 0 0.5rem",
  },
})

export const InputDescription = styled("span", {
  base: {
    margin: "auto 0",
    color: "grey",
  },
})

export const Textarea = styled("textarea", {
  base: {
    margin: "0.5rem 0 1rem",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: 4,
    resize: "vertical", // Allow vertical resizing
    minHeight: "100px", // Minimum height
    maxHeight: "500px", // Maximum height
    overflow: "auto", // Add scroll if content exceeds max height
  },
})

export const ErrorMessage = styled("p", {
  base: {
    color: "var(--leaf-status-red)",
    margin: "0 0 1rem",
  },
})

export const Button = styled("button", {
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

export const DeleteButton = styled("button", {
  base: {
    display: "block",
    padding: "4px 8px",
    margin: "4px auto",
    backgroundColor: "var(--leaf-status-red)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "var(--leaf-grey-80)",
      cursor: "not-allowed",
    },
  },
})

export const EditButton = styled("button", {
  base: {
    display: "block",
    padding: "4px 8px",
    margin: "4px auto",
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

export const TableWrapper = styled("div", {
  base: {
    width: "100%",
    marginTop: "20px",
  },
})

export const ScheduleTable = styled("table", {
  base: {
    width: "100%",
    borderCollapse: "collapse",
  },
})

export const ScheduleTheadTr = styled("tr", {
  base: {
    background: "#f8f8f8",
  },
})

export const ScheduleTh = styled("th", {
  base: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    fontWeight: 600,
  },
})

export const ScheduleTd = styled("td", {
  base: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
})

export const ScheduleTbodyTr = styled("tr", {
  base: {},
  variants: {
    striped: {
      true: {
        background: "#fafbfc",
      },
      false: {
        background: "#fff",
      },
    },
  },
})

export const ModalOverlay = styled("div", {
  base: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
})

export const ModalContent = styled("div", {
  base: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    position: "relative",
    width: "50vw",
    maxWidth: "60%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
  },
})

export const CloseButton = styled("button", {
  base: {
    position: "absolute",
    top: "10px",
    right: "30px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "var(--leaf-text-primary)",
    zIndex: 1001,
    "&:hover": {
      color: "var(--leaf-primary-60)",
    },
  },
})

export const AddButton = styled("button", {
  base: {
    padding: "4px 8px",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "var(--leaf-primary-50)",
    },
  },
})

export const RemoveButton = styled("button", {
  base: {
    padding: "4px 8px",
    backgroundColor: "var(--leaf-status-red)",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "14px",
    minWidth: "24px",
    "&:hover": {
      backgroundColor: "#dc3545",
    },
  },
})

export const PreviewBox = styled("div", {
  base: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: 4,
    padding: "12px",
    margin: "8px 0 16px 0",
  },
})

export const PreviewLabel = styled("span", {
  base: {
    display: "block",
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: 500,
    marginBottom: "4px",
  },
})

export const PreviewContent = styled("span", {
  base: {
    display: "block",
    fontSize: "14px",
    color: "#212529",
    fontFamily: "monospace",
    wordBreak: "break-all",
    backgroundColor: "white",
    padding: "8px",
    borderRadius: 2,
    border: "1px solid #e9ecef",
  },
})
