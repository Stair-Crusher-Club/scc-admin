import { styled } from "@/styles/jsx"

export const DownloadButton = styled("button", {
  base: {
    display: "block",
    padding: "4px 8px",
    margin: "4px auto",
    backgroundColor: "var(--leaf-primary-40)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    border: "none",
    _disabled: {
      backgroundColor: "var(--leaf-grey-80)",
      cursor: "not-allowed",
    },
  },
})
