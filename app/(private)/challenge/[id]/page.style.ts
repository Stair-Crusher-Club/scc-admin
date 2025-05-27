import { styled } from "@/styles/jsx"

export const Form = styled("form", {
  base: { padding: 32 },
})

export const ButtonGroup = styled("div", {
  base: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    width: 800,
  },
})

export const SubmitButton = styled("button", {
  base: {
    flex: 1,
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

export const EditButton = styled("button", {
  base: {
    flex: 1,
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

export const CancelButton = styled("button", {
  base: {
    flex: 1,
    padding: 8,
    backgroundColor: "var(--leaf-grey-80)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "#e0e0e0",
      cursor: "not-allowed",
    },
  },
})
