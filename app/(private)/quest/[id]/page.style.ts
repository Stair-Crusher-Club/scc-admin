import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    display: "flex",
    height: "full",
  },
  variants: {
    size: {
      small: {},
      large: {},
    },
  },
})

export const Map = styled("div", {
  base: {
    width: "full",
    height: "full",
  },
})

export const Loading = styled("div", {
  base: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "full",
    height: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "gray.200",
  },
})

export const SummaryButton = styled("button", {
  base: {
    position: "absolute",
    zIndex: 10,
    bottom: "1rem",
    right: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: "0.25rem",
    cursor: "pointer",
  },
})
