import { styled } from "@/styles/jsx"

export const Fullscreen = styled("div", {
  base: {
    width: "full",
    height: "full",
  },
})

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
    marginLeft: "20px",
    marginBottom: "16px",
    listStyle: "disc",
  },
})

export const Button = styled("button", {
  base: {
    width: "full",
    padding: "12px",
    background: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: "4px",
  },
})
