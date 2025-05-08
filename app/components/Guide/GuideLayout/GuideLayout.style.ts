import { styled } from "@/styles/jsx"

export const Header = styled("header", {
  base: {
    width: "full",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 999,
  },
})

export const Nav = styled("nav", {
  base: {
    maxWidth: "640px",
    width: "full",
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "end",
    borderBottom: "1px solid #B5B5C0",
    gap: 20,
    paddingX: 16,
  },
})

export const Menu = styled("a", {
  base: {
    width: "full",
    display: "block",
    padding: "10px 0 6px",
    textAlign: "center",
    fontSize: 20,
    margin: 0,
  },
  variants: {
    active: {
      true: {
        fontWeight: "bold",
        borderBottom: "4px solid #1D85FF",
      },
      false: {
        color: "#9797A6",
        borderBottom: "4px solid transparent",
      },
    },
  },
})

export const Main = styled("main", {
  base: {
    maxWidth: "640px",
    width: "full",
    margin: "60px auto 0",
  },
})
