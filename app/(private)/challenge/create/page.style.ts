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
    height: "48px",
    paddingInline: "16px",
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
    height: "full",
  },
})

export const Form = styled("form", {
  base: { padding: "2rem" },
})

export const SubmitButton = styled("button", {
  base: {
    width: "100%",
    padding: "0.5rem 0.5rem",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: "0.25rem",
  },
})
