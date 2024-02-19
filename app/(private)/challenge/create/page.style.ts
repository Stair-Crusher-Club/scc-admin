import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    display: "flex",
    flexDirection: "column",
    height: "full",
  },
})

export const Header = styled("header", {
  base: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: 48,
    paddingInline: 16,
    background: "white",
    borderBottom: "1px solid #eaeaea",
    transition: "transform 0.3s",
    boxShadow: "0 0 4px 2px rgba(0, 0, 0, 0.1)",
  },
})

export const Body = styled("div", {
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
