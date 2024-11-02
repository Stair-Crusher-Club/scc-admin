import { styled } from "@/styles/jsx"

export const Contents = styled("main", {
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: 32,
  },
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
