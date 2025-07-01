import { styled } from "@/styles/jsx"

export const Overlay = styled("div", {
  base: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.3)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
})

export const ModalForm = styled("form", {
  base: {
    background: "white",
    padding: 24,
    borderRadius: 8,
    minWidth: 320,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
  },
})

export const Title = styled("h2", {
  base: {
    marginBottom: 16,
  },
})

export const Field = styled("div", {
  base: {
    marginBottom: 12,
  },
})

export const ButtonRow = styled("div", {
  base: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
})

export const Button = styled("button", {
  base: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
  },
  variants: {
    primary: {
      true: {
        background: "#0066cc",
        color: "white",
      },
      false: {
        background: "#f5f5f5",
        color: "#333",
      },
    },
  },
})
