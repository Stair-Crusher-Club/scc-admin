import { styled } from "@/styles/jsx"

export const Header = styled("header", {
  base: {
    position: "fixed",
    zIndex: 10,
    top: 0,
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "48px",
    paddingInline: "16px",
    background: "white",
    borderBottom: "1px solid #eaeaea",
    transition: "transform 0.3s",
  },
  variants: {
    hidden: {
      true: { transform: "translateY(-100%)" },
      false: { transform: "translateY(0)" },
    },
  },
})

export const Title = styled("h2", {
  base: {
    marginLeft: 4,
  },
})
