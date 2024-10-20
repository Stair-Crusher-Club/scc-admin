import { styled } from "@/styles/jsx"

export const Actions = styled("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
})

export const AcceptButton = styled("button", {
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

export const DeleteButton = styled("button", {
  base: {
    display: "block",
    padding: "4px 8px",
    margin: "4px auto",
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
