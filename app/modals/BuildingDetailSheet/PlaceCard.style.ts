import { styled } from "@/styles/jsx"

export const PlaceCard = styled("div", {
  base: {
    display: "flex",
    gap: 16,
    margin: "0 16px 24px",
    alignItems: "flex-end",
  },
})

export const NameColumn = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    width: "calc(100% - 148px)",
    flex: 1,
  },
})

export const Badges = styled("div", {
  base: {
    display: "flex",
    gap: 4,
    marginBottom: 4,
  },
})

export const ActionsColumn = styled("div", {
  base: {
    display: "flex",
    flex: "0 0 100px",
    gap: 4,
    lineHeight: 1,
  },
})

export const PlaceName = styled("h3", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 16,
    fontWeight: 500,
    "& span": {
      whiteSpace: "pre",
      textOverflow: "ellipsis",
      overflow: "hidden",
    },
  },
})

export const CheckboxWrapper = styled("div", {
  base: {
    width: 48,
    textAlign: "center",
  },
})

export const PlaceStatusBadge = styled("span", {
  base: {
    display: "inline-block",
    padding: "6px 7px",
    borderRadius: 4,
    fontSize: 12,
    lineHeight: 1,
    color: "white",
    verticalAlign: "bottom",
  },
  variants: {
    status: {
      normal: {
        backgroundColor: "var(--leaf-primary-95)",
        color: "var(--leaf-primary-60)",
      },
      good: {
        backgroundColor: "var(--leaf-primary-60)",
      },
      warn: {
        backgroundColor: "#FF9202",
      },
      unknown: {
        backgroundColor: "var(--leaf-grey-95)",
        color: "var(--leaf-grey-70)",
      },
    },
  },
})

export const Button = styled("button", {
  base: {
    flexShrink: 0,
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "white",
    overflow: "hidden",
    cursor: "pointer",
  },
})

export const Link = styled("a", {
  base: {
    flexShrink: 0,
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "white",
    overflow: "hidden",
    cursor: "pointer",
  },
})
