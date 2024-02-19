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

export const Map = styled("div", {
  base: {
    width: "full",
    height: "full",
  },
})

export const Loading = styled("div", {
  base: {
    position: "absolute",
    zIndex: 100,
    top: "0",
    left: "0",
    width: "full",
    height: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.3)",
    color: "white",
  },
})

export const Form = styled("form", {
  base: {
    position: "relative",
    zIndex: 1,
    width: 400,
    padding: 24,
    boxShadow: "0 0 6px 4px rgba(0, 0, 0, 0.1)",
  },
})

export const Buttons = styled("div", {
  base: {
    display: "flex",

    gap: 4,
  },
})
export const PreviewButton = styled("button", {
  base: {
    width: "full",
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#1D85FF",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
  },
})

export const SubmitButton = styled("button", {
  base: {
    width: "full",
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#1D85FF",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "gray.400",
      cursor: "not-allowed",
    },
  },
})
