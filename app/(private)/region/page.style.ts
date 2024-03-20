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
    justifyContent: "space-between",
    width: "100%",
    height: 64,
    paddingInline: 16,
    background: "white",
    borderBottom: "1px solid #eaeaea",
    transition: "transform 0.3s",
    boxShadow: "0 0 4px 2px rgba(0, 0, 0, 0.1)",

    fontSize: 20,
    fontWeight: "bold",
  },
})

export const PageAction = styled("button", {
  base: {
    padding: "4px 16px",
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: "#1D85FF",
    color: "white",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: "normal",
  },
})

export const Map = styled("div", {
  base: {
    width: "full",
    height: "full",
  },
})

export const ListButton = styled("button", {
  base: {
    position: "absolute",
    zIndex: 10,
    bottom: 16,
    right: 16,
    padding: "8px 16px",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
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
