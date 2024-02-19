import { styled } from "@/styles/jsx"

export const Modal = styled("div", {
  base: {
    minWidth: "320px",
    width: "80%",
    maxWidth: "480px",
    padding: "32px 24px",
    borderRadius: "8px",
    background: "white",
  },
})

export const List = styled("ul", {
  base: {
    marginLeft: 20,
    marginBottom: 16,
    listStyle: "disc",
  },
})

export const Button = styled("button", {
  base: {
    width: "full",
    padding: 12,
    background: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
  },
})
