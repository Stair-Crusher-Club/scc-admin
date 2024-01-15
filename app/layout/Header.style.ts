import { styled } from "@/styles/jsx"

export const Header = styled("header", {
  base: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderBottom: "1px solid #eaeaea",
    transition: "transform 0.3s",
  },
  variants: {
    size: {
      desktop: { position: "relative", height: "72px" },
      mobile: {
        position: "fixed",
        top: 0,
        width: "100%",
        height: "48px",
        paddingInline: "16px",
        zIndex: 10,
      },
    },
    hidden: {
      true: { transform: "translateY(-100%)" },
      false: { transform: "translateY(0)" },
    },
  },
})

export const Title = styled("h2", {
  base: {
    marginLeft: "4px",
  },
})
