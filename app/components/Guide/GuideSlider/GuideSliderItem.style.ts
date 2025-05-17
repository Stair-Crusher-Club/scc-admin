import { styled } from "@/styles/jsx"

export const Container = styled("div", {
  base: {
    border: "1px solid #E4E9EF",
    borderRadius: 12,
    overflow: "hidden",
  },
})

//#region Image
export const ImageSection = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    alignItems: "end",
  },
})

export const ArrowButton = styled("button", {
  base: {
    position: "absolute",
    top: "50%",
    zIndex: 1,
    transform: "translateY(-50%)",
    willChange: "transform",
    padding: 6,
  },
  variants: {
    position: {
      prev: {
        left: 12,
      },
      next: {
        right: 12,
      },
    },
  },
})
//#endregion

//#region Detail
export const DetailSection = styled("div", {
  base: {
    height: 113,
    backgroundColor: "#EBF5FF",
    padding: "14px 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
})

// Dots
export const Dots = styled("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
})

export const Dot = styled("div", {
  base: {
    width: 5,
    height: 5,
    borderRadius: "50%",
  },
  variants: {
    isCurrent: {
      true: {
        background: "#131317",
      },
      false: {
        background: "#D0D0D9",
      },
    },
  },
})

// Description
export const DescriptionItem = styled("div", {
  base: { textAlign: "center" },
})

export const Title = styled("h4", {
  base: {
    color: "#0E64D3",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: 4,
  },
})

export const Description = styled("p", {
  base: { fontSize: "14px" },
})
//#endregion

// Extra Description
export const ExtraDescriptionSection = styled("div", {
  base: {
    marginTop: 12,
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minHeight: 106,
  },
})

export const ExtraDescriptionTitle = styled("h4", {
  base: { fontWeight: "bold", fontSize: 13 },
})

export const ExtraDescriptionItem = styled("li", {
  variants: {
    hasStyle: {
      true: { position: "relative", paddingLeft: 8 },
    },
  },
})

export const ExtraDescriptionDot = styled("span", {
  base: {
    position: "absolute",
    left: 0,
    top: 9,
    width: 3,
    height: 3,
    borderRadius: "50%",
    backgroundColor: "black",
  },
})

export const ExtraDescription = styled("p", {
  base: {
    fontSize: 13,
    lineHeight: "160%",
  },
})
