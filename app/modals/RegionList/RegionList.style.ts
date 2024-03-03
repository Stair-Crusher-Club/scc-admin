import { styled } from "@/styles/jsx"

export const List = styled("ul", {
  base: {
    width: 300,
    padding: "0 24px",
  },
})
export const RegionItem = styled("li", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    padding: 4,
    _hover: {
      backgroundColor: "var(--leaf-primary-98)",
    },
  },
})
export const RegionName = styled("span", { base: {} })
export const DeleteButton = styled("button", {
  base: {
    fontSize: 12,
    color: "var(--leaf-status-red)",
    cursor: "pointer",
  },
})
