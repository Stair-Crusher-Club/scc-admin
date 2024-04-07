import { styled } from "@/styles/jsx"

export const Form = styled("form", {
  base: { padding: 32 },
})

export const SubmitButton = styled("button", {
  base: {
    width: 800,
    padding: 8,
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
    width: 800,
    padding: 8,
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
