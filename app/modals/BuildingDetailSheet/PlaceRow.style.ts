import { styled } from "@/styles/jsx"

export const PlaceRow = styled("tr")

export const Cell = styled("td", {
  base: {
    padding: "8px 4px",
    textAlign: "center",
    lineHeight: 1,
  },
})

export const ExternalMap = styled("button", {
  base: {
    width: "20px",
    height: "20px",
    border: "1px solid #ccc",
    verticalAlign: "middle",
    marginLeft: "4px",
    cursor: "pointer",
  },
})
