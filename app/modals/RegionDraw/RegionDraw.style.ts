import { styled } from "@/styles/jsx"

export const Modal = styled("div", {
  base: {
    padding: 20,
    borderRadius: 8,
    background: "white",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
})

export const ButtonsWrapper = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: 300,
    padding: "20px 20px",
  },
})

export const Button = styled("button", {
  base: {
    padding: "8px",
    background: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _hover: {
      background: "var(--leaf-primary-50)",
    },
  },
})
