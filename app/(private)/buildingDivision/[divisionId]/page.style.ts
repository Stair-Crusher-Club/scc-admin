import { styled } from "@/styles/jsx"

export const BackButton = styled("button", {
  base: {
    marginBottom: "16px",
    padding: "8px 12px",
    backgroundColor: "white",
    border: "1px solid",
    borderColor: "gray.300",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    _hover: {
      backgroundColor: "gray.50",
    },
  },
})

export const LoadingMessage = styled("p", {
  base: {
    padding: "32px",
    textAlign: "center",
    color: "gray.500",
  },
})

export const Header = styled("div", {
  base: {
    marginBottom: "24px",
  },
})

export const TitleRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
})

export const Title = styled("h1", {
  base: {
    fontSize: "24px",
    fontWeight: "bold",
  },
})

export const StatusBadge = styled("span", {
  base: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
  },
  variants: {
    status: {
      PENDING: {
        backgroundColor: "yellow.100",
        color: "yellow.800",
      },
      CONFIRMED: {
        backgroundColor: "green.100",
        color: "green.800",
      },
      IGNORED: {
        backgroundColor: "gray.100",
        color: "gray.800",
      },
    },
  },
})

export const InfoSection = styled("div", {
  base: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "gray.200",
    padding: "20px",
    marginBottom: "24px",
  },
})

export const InfoRow = styled("div", {
  base: {
    display: "flex",
    padding: "12px 0",
    borderBottom: "1px solid",
    borderColor: "gray.100",
    _last: {
      borderBottom: "none",
    },
  },
})

export const InfoLabel = styled("div", {
  base: {
    width: "150px",
    fontSize: "14px",
    fontWeight: "600",
    color: "gray.700",
  },
})

export const InfoValue = styled("div", {
  base: {
    flex: 1,
    fontSize: "14px",
    color: "gray.900",
  },
})

export const ActionSection = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
})

export const ActionButton = styled("button", {
  base: {
    padding: "12px 24px",
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
      },
      secondary: {
        backgroundColor: "white",
        borderColor: "gray.300",
        color: "gray.700",
        _hover: {
          backgroundColor: "gray.50",
        },
      },
    },
  },
})

export const SubBuildingsSection = styled("div", {
  base: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "gray.200",
    padding: "20px",
  },
})

export const SubBuildingsHeader = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
})

export const SubBuildingsTitle = styled("h2", {
  base: {
    fontSize: "18px",
    fontWeight: "600",
  },
})

export const AddButton = styled("button", {
  base: {
    padding: "8px 16px",
    backgroundColor: "blue.500",
    color: "white",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    _hover: {
      backgroundColor: "blue.600",
    },
  },
})

export const EmptyMessage = styled("p", {
  base: {
    padding: "32px",
    textAlign: "center",
    color: "gray.500",
  },
})

export const SubBuildingsList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
})

export const SubBuildingCard = styled("div", {
  base: {
    padding: "16px",
    backgroundColor: "gray.50",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: "gray.200",
  },
})

export const SubBuildingName = styled("h3", {
  base: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
  },
})

export const SubBuildingInfo = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
})

export const SubBuildingInfoRow = styled("div", {
  base: {
    display: "flex",
    fontSize: "14px",
  },
})

export const SubBuildingInfoLabel = styled("span", {
  base: {
    width: "120px",
    fontWeight: "500",
    color: "gray.600",
  },
})

export const SubBuildingInfoValue = styled("span", {
  base: {
    flex: 1,
    color: "gray.900",
    wordBreak: "break-all",
  },
})

export const FormContainer = styled("form", {
  base: {
    padding: "20px",
    backgroundColor: "blue.50",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: "blue.200",
    marginBottom: "16px",
  },
})

export const FormTitle = styled("h3", {
  base: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
  },
})

export const FormField = styled("div", {
  base: {
    marginBottom: "16px",
  },
})

export const FormLabel = styled("label", {
  base: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "gray.700",
  },
})

export const FormInput = styled("input", {
  base: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid",
    borderColor: "gray.300",
    borderRadius: "6px",
    _focus: {
      outline: "none",
      borderColor: "blue.500",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
})

export const FormTextarea = styled("textarea", {
  base: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid",
    borderColor: "gray.300",
    borderRadius: "6px",
    minHeight: "80px",
    resize: "vertical",
    fontFamily: "monospace",
    _focus: {
      outline: "none",
      borderColor: "blue.500",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
})

export const FormActions = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
  },
})

export const FormButton = styled("button", {
  base: {
    padding: "10px 20px",
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
      },
      secondary: {
        backgroundColor: "white",
        borderColor: "gray.300",
        color: "gray.700",
        _hover: {
          backgroundColor: "gray.50",
        },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

export const BoundaryPreview = styled("div", {
  base: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "gray.50",
    borderRadius: "6px",
    fontSize: "13px",
    color: "gray.700",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
})
