import { styled } from "@/styles/jsx"

export const Sidebar = styled("aside", {
  base: {
    position: "relative",
  },
  variants: {
    size: {
      desktop: {
        position: "relative",
        flex: "240px 0 0",
        background: "yellow",
      },
      mobile: {
        position: "absolute",
        zIndex: 10,
        top: "0",
        left: "0",
        width: "240px",
        height: "full",
        background: "green",
        transform: "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
      },
    },
    opened: {
      true: {
        transform: "translateX(0)",
      },
      false: {},
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
    background: "rgba(255,255,255,0.5)",
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
