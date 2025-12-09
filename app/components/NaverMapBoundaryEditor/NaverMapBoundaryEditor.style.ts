import { styled } from "@/styles/jsx"

export const Container = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
  },
})

export const MapContainer = styled("div", {
  base: {
    width: "100%",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "gray.300",
    overflow: "hidden",
  },
})

export const ControlPanel = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "gray.200",
  },
})

export const InfoSection = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
})

export const InfoText = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "gray.700",
  },
})

export const StatusBadge = styled("span", {
  base: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  variants: {
    status: {
      drawing: {
        backgroundColor: "blue.100",
        color: "blue.700",
      },
      complete: {
        backgroundColor: "green.100",
        color: "green.700",
      },
    },
  },
})

export const PointCount = styled("span", {
  base: {
    fontSize: "14px",
    fontWeight: "500",
    color: "gray.600",
  },
})

export const ButtonGroup = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
})

export const ActionButton = styled("button", {
  base: {
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid",
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "blue.500",
        borderColor: "blue.500",
        color: "white",
        _hover: {
          backgroundColor: "blue.600",
        },
        _disabled: {
          _hover: {
            backgroundColor: "blue.500",
          },
        },
      },
      secondary: {
        backgroundColor: "white",
        borderColor: "gray.300",
        color: "gray.700",
        _hover: {
          backgroundColor: "gray.50",
        },
        _disabled: {
          _hover: {
            backgroundColor: "white",
          },
        },
      },
      danger: {
        backgroundColor: "white",
        borderColor: "red.300",
        color: "red.600",
        _hover: {
          backgroundColor: "red.50",
        },
        _disabled: {
          _hover: {
            backgroundColor: "white",
          },
        },
      },
    },
  },
})

export const ErrorContainer = styled("div", {
  base: {
    padding: "32px",
    textAlign: "center",
    backgroundColor: "red.50",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "red.200",
  },
})

export const ErrorMessage = styled("p", {
  base: {
    fontSize: "14px",
    color: "red.700",
    margin: 0,
  },
})
