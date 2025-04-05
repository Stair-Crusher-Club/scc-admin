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
    "&:active": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
  },
})

export const DeleteButton = styled("button", {
  base: {
    position: "absolute",
    top: "50%",
    right: 48,
    transform: "translateY(-50%)",
    padding: 4,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
  },
})

export const GuideMessage = styled("div", {
  base: {
    padding: "12px 20px",
    margin: "0 16px",
    backgroundColor: "var(--leaf-primary-98)",
  },
})

export const Status = styled("p", {
  base: {
    fontSize: 15,
    fontWeight: 500,
    textAlign: "center",
    "& b": {
      color: "var(--leaf-primary-70)",
    },
    "& small": {
      fontSize: 12,
      color: "var(--leaf-grey-70)",
      letterSpacing: "-0.03em",
    },
  },
})

export const Header = styled("div", {
  base: {
    display: "flex",
    paddingTop: 16,
    paddingBottom: 4,
    margin: "0 16px",
    justifyContent: "flex-end",
  },
})

export const ChcekcboxLabel = styled("span", {
  base: {
    display: "inline-block",
    width: 50,
    textAlign: "center",
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "pre",
  },
})

export const ViewToggle = styled("button", {
  base: {
    position: "absolute",
    top: "50%",
    right: 60,
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
