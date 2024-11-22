import { styled } from "@/styles/jsx"

export const PlaceCard = styled("div", {
  base: {
    margin: "8px 16px",
    padding: "16px 20px",
    boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.2)",
    borderRadius: 4,
  },
})

export const Header = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
})

export const PlaceName = styled("h3", {
  base: {
    fontSize: 16,
    fontWeight: 600,
  },
})

export const PlaceStatusBadge = styled("span", {
  base: {
    display: "inline-block",
    marginLeft: 4,
    padding: "2px 4px",
    fontSize: 12,
    color: "white",
    borderRadius: 4,
    verticalAlign: "bottom",
  },
  variants: {
    status: {
      good: {
        backgroundColor: "var(--leaf-primary-60)",
      },
      bad: {
        backgroundColor: "#cf3c3b",
      },
      warn: {
        backgroundColor: "#da952e",
      },
      unknown: {
        backgroundColor: "#6dd1ad",
      },
    },
  },
})

export const Buttons = styled("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
})

export const Button = styled("button", {
  base: {
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "white",
    overflow: "hidden",
    cursor: "pointer",
  },
})

export const Body = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
  },
})

export const ActionButton = styled("button", {
  base: {
    width: "50%",
    height: 36,
    borderRadius: 4,
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  },
})

export const ClosedConfirm = styled(ActionButton, {
  base: {
    border: "1px solid #861500",
    color: "#861500",
    background: "white",
    fontSize: 12,
  },
})

export const NotAccessible = styled(ActionButton, {
  base: {
    border: "1px solid #861500",
    color: "#861500",
    background: "white",
    fontSize: 12,
  },
})

export const ConquerButton = styled(ActionButton, {
  base: {
    background: "var(--leaf-primary-60)",
    color: "white",
  },
})

export const RevertButton = styled(ActionButton, {
  base: {
    width: "100%",
    background: "white",
    border: "1px solid var(--leaf-grey-70)",
    color: "var(--leaf-grey-10)",
  },
})
