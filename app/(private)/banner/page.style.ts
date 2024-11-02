import { styled } from "@/styles/jsx"

export const ImageWrapper = styled("div", {
  base: {
    width: "300px",
  },
});

export const DeleteButton = styled("button", {
  base: {
    display: "block",
    padding: "4px 8px",
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
