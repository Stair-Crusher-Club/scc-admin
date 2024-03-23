import { styled } from "@/styles/jsx"

export const Page = styled("main", {
  base: {
    padding: 32,
  },
})

export const PageTitle = styled("h1", {
  base: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
  },
})
export const Accessibilities = styled("ul", {
  base: {},
})
export const Accessibility = styled("li", {
  base: {
    padding: "4px 8px",
    margin: "4px 0",
    cursor: "pointer",
    _hover: {
      backgroundColor: "#f5f5f5",
    },
  },
})
export const SearchButton = styled("button", {
  base: {
    padding: "8px 16px",
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "var(--leaf-grey-80)",
      cursor: "not-allowed",
    },
  },
})
export const LoadNextPageButton = styled("button", {
  base: {
    padding: 8,
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "var(--leaf-grey-80)",
      cursor: "not-allowed",
    },
  },
})
export const DeleteButton = styled("button", {
  base: {
    padding: 8,
    backgroundColor: "var(--leaf-primary-60)",
    color: "white",
    borderRadius: 4,
    cursor: "pointer",
    _disabled: {
      backgroundColor: "var(--leaf-grey-80)",
      cursor: "not-allowed",
    },
  },
})
