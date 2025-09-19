import { styled } from "@/styles/jsx"

export const Dialog = styled("div", {
  base: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80vh",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
  },
  variants: {
    visible: {
      true: {
        opacity: 1,
        pointerEvents: "all",
      },
      false: {
        opacity: 0,
        pointerEvents: "none",
      },
    },
  },
})

export const DialogHeader = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
  },
})

export const CloseButton = styled("button", {
  base: {
    position: "absolute",
    left: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
})

export const DialogTitle = styled("h2", {
  base: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
})

export const DialogBody = styled("div", {
  base: {
    padding: "20px",
    overflow: "auto",
    flex: 1,
  },
})

export const Description = styled("p", {
  base: {
    margin: "0 0 20px 0",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.5",
  },
})

export const ItemsContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },
})

export const ItemRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f9f9f9",
  },
})

export const ItemIndex = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    background: "#007bff",
    color: "white",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: "600",
    flexShrink: 0,
  },
})

export const InputContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
})

export const Label = styled("label", {
  base: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#333",
  },
})

export const Input = styled("input", {
  base: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    background: "white",
    "&:focus": {
      outline: "none",
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.1)",
    },
  },
})

export const Select = styled("select", {
  base: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    background: "white",
    cursor: "pointer",
    "&:focus": {
      outline: "none",
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.1)",
    },
  },
})

export const RemoveButton = styled("button", {
  base: {
    padding: "8px 12px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    flexShrink: 0,
    "&:hover": {
      background: "#c82333",
    },
  },
})

export const AddButton = styled("button", {
  base: {
    width: "100%",
    padding: "12px",
    background: "#f8f9fa",
    border: "2px dashed #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#666",
    cursor: "pointer",
    "&:hover": {
      background: "#e9ecef",
      borderColor: "#007bff",
    },
  },
})

export const DialogFooter = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #eee",
    background: "#f8f9fa",
  },
})

export const CancelButton = styled("button", {
  base: {
    flex: 1,
    padding: "12px 16px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    "&:hover:not(:disabled)": {
      background: "#f8f9fa",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
})

export const ConfirmButton = styled("button", {
  base: {
    flex: 1,
    padding: "12px 16px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    "&:hover:not(:disabled)": {
      background: "#0056b3",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
})

export const ModeSelector = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
})

export const ModeButton = styled("button", {
  base: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    background: "white",
    color: "#666",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#f8f9fa",
    },
  },
  variants: {
    active: {
      true: {
        background: "#007bff",
        color: "white",
        "&:hover": {
          background: "#0056b3",
        },
      },
    },
  },
})

export const TypeSelector = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "16px",
  },
})

export const TextInputContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
})

export const TextArea = styled("textarea", {
  base: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "monospace",
    background: "white",
    resize: "vertical",
    minHeight: "120px",
    "&:focus": {
      outline: "none",
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.1)",
    },
    "&::placeholder": {
      color: "#999",
    },
  },
})

export const TextHint = styled("div", {
  base: {
    fontSize: "12px",
    color: "#666",
    lineHeight: "1.4",
  },
})
