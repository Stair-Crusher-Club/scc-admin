import { styled } from "@/styles/jsx"

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

export const ModalHeader = styled("div", {
  base: {
    marginBottom: "20px",
    borderBottom: "1px solid var(--leaf-grey-80)",
    paddingBottom: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
})

export const ModalHeaderTitle = styled("div", {
  base: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "var(--leaf-text-primary)",
  },
})

export const ModalHeaderBody = styled("div", {
  base: {
    fontSize: "14px",
    fontWeight: "normal",
    color: "var(--leaf-text-primary)",
  },
})

export const ModalBody = styled("div", {
  base: {
    width: "100%",
    marginBottom: "10px",
  },
})

export const ModalBodyRow = styled("div", {
  base: {
    width: "100%",
    display: "inline-flex",
    gap: "20px",
  },
})

export const ModalFooter = styled("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    borderTop: "1px solid var(--leaf-grey-80)",
    paddingTop: "10px",
  },
})

export const SaveButton = styled("button", {
  base: {
    padding: "8px 16px",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
    border: "none",
    "&:hover": {
      backgroundColor: "var(--leaf-primary-70)",
    },
  },
})

export const CancelButton = styled("button", {
  base: {
    padding: "8px 16px",
    backgroundColor: "var(--leaf-status-red)",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
    border: "none",
    "&:hover": {
      backgroundColor: "var(--leaf-status-lightRed)",
    },
  },
})
