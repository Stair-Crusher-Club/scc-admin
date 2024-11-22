import { styled } from "@/styles/jsx"

export const CustomTitle = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    flexFlow: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "full",
    gap: 4,
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    "& small": {
      fontSize: 14,
      fontWeight: 500,
    },
  },
})

export const ReloadButton = styled("button", {
  base: {
    position: "absolute",
    top: "50%",
    right: 20,
    transform: "translateY(-50%)",
    padding: 4,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
  },
})
