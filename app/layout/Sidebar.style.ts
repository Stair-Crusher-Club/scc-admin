import { styled } from "@/styles/jsx"

export const Sidebar = styled("aside", {
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease-in-out",
  },
  variants: {
    size: {
      desktop: {
        position: "relative",
        flex: "240px 0 0",
        background: "oklch(62.84% 0.202 256.31)",
      },
      mobile: {
        position: "absolute",
        zIndex: 10,
        top: "0",
        left: "0",
        width: "240px",
        height: "full",
        background: "oklch(62.84% 0.202 256.31)",
      },
    },
    opened: {
      true: {
        transform: "translateX(0)",
      },
      false: {
        transform: "translateX(-100%)",
      },
    },
  },
})

export const Title = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    fontSize: "1.5rem",
    color: "white",
    "& img": {
      display: "inline-block",
    },
  },
})

export const Menu = styled("ul", {
  base: {
    paddingBlock: "1rem",
  },
})

export const MenuItem = styled("li", {
  base: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    color: "white",
    cursor: "pointer",
    _hover: {
      background: "rgba(255,255,255,0.1)",
    },
  },
  variants: {
    isActive: {
      true: {
        background: "oklch(50% 0.202 256.31)",
      },
      false: {},
    },
  },
})

export const LogoutButton = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    fontSize: "0.75rem",
    color: "white",
    cursor: "pointer",
    _hover: {
      background: "rgba(255,255,255,0.1)",
    },
  },
})

export const SidebarDim = styled("div", {
  base: {
    position: "fixed",
    zIndex: 9,
    top: "0",
    left: "0",
    width: "full",
    height: "full",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    transition: "opacity 0.3s ease-in-out",
  },
  variants: {
    opened: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0,
        pointerEvents: "none",
      },
    },
  },
})
