import { styled } from "@/styles/jsx"

export const AccessibilityRow = styled("tr")

export const Cell = styled("td", {
  base: {
    margin: "8px 0",
    padding: "8px 4px",
    textAlign: "center",
    lineHeight: 0,
    border: "1px black solid",
  },
})

export const Image = styled("img", {
  base: {
    width: 200,
    margin: "4px auto"
  },
})

export const DeleteButton = styled("button", {
  base: {
    display: "block",
    padding: "16px 8px",
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
