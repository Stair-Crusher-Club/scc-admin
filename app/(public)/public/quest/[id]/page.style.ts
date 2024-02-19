import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    display: "flex",
    width: "full",
    height: "full",
  },
  variants: {
    size: {
      small: {},
      large: {},
    },
  },
})

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

export const GuideButton = styled("button", {
  base: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    right: "16px",
    padding: "4px 8px",
    border: "1px solid var(--leaf-grey-70)",
    borderRadius: "4px",
    fontSize: "14px",
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
