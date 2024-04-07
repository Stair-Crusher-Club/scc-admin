import { styled } from "@/styles/jsx"

export const DesktopHeader = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    left: 0,
    zIndex: 10,
    flexShrink: 0,
    display: "flex",
    width: "full",
    height: "48px",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: "16px",
    background: "white",
    borderBottom: "1px solid #eaeaea",
  },
})

export const MobileHeader = styled("header", {
  base: {
    position: "fixed",
    zIndex: 10,
    top: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingBottom: 2,
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
})

export const ActionButton = styled("button", {
  base: {
    padding: "4px 16px",
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: "#1D85FF",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
  },
})
