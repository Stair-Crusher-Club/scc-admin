import { styled } from "@/styles/jsx"

export const Table = styled("table", {
  base: {
    width: "full",
    borderCollapse: "collapse",
  },
})

export const HeadingRow = styled("tr", {
  base: {
    backgroundColor: "#f9f9f9",
  },
  variants: {
    disabledSticky: {
      false: { position: "sticky", top: 0, zIndex: 99 },
    },
  },
})

export const HeadingCell = styled("th", {
  base: {
    padding: "8px 16px",
    textAlign: "center",
    wordBreak: "keep-all",
    fontWeight: "bold",
  },
})

export const Row = styled("tr", {
  base: {
    borderBottom: "1px solid var(--leaf-grey-95)",
  },
})

export const Cell = styled("td", {
  base: { padding: "8px 16px" },
})

export const EmptyMessageCell = styled("td", {
  base: {
    textAlign: "center",
  },
})
