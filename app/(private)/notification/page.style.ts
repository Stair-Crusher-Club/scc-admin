import { styled } from "@/styles/jsx"

export const InputTitle = styled("span", {
  base: {
    fontSize: "1rem",
    textWrap: "nowrap",
    margin: "0 0 0.5rem",
  },
})

export const InputDescription = styled("span", {
  base: {
    margin: "auto 0",
    color: "grey",
  },
})

export const Textarea = styled("textarea", {
  base: {
    margin: "0.5rem 0 1rem",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: 4,
    resize: "vertical", // Allow vertical resizing
    minHeight: "100px", // Minimum height
    maxHeight: "500px", // Maximum height
    overflow: "auto", // Add scroll if content exceeds max height
  },
})

export const ErrorMessage = styled("p", {
  base: {
    color: "var(--leaf-status-red)",
    margin: "0 0 1rem",
  },
})

export const Button = styled("button", {
  base: {
    padding: "8px 16px",
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
