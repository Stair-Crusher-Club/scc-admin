import { styled } from "@/styles/jsx"

export const Modal = styled("div", {
  base: {
    minWidth: "320px",
    width: "80%",
    maxWidth: "400px",
    padding: "32px 24px 24px",
    borderRadius: "8px",
    background: "white",
  },
})

export const Title = styled("h3", {
  base: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
    textAlign: "center",
  },
})

export const Description = styled("p", {
  base: {
    fontSize: "14px",
    color: "#232328",
    marginBottom: "24px",
    textAlign: "center",
  },
})

export const ButtonWrapper = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
  },
})

export const CancelButton = styled("button", {
  base: {
    flex: 1,
    padding: "12px",
    background: "#f5f5f5",
    color: "#333",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
})

export const ConfirmButton = styled("button", {
  base: {
    flex: 1,
    padding: "12px",
    background: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
})
