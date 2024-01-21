import { styled } from "@/styles/jsx"

export const CheckBox = styled("div", {
  base: {
    display: "inline-block",
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "full",
    backgroundColor: "white",
    border: "1px solid",
    borderColor: "#B5B5C0",
  },
  variants: {
    disabled: {
      true: { backgroundColor: "#d4d7d9", opacity: 0.4 },
      false: {},
    },
    checked: {
      true: { backgroundColor: "#1D85FF", borderColor: "#1D85FF" },
      false: {},
      notAll: { borderWidth: "3px", borderColor: "#1D85FF" },
    },
  },
  compoundVariants: [
    {
      disabled: true,
      checked: true,
      css: {
        backgroundColor: "#1D85FF",
        borderColor: "#1D85FF",
      },
    },
  ],
})

export const CheckItemInput = styled("input", { base: { display: "none" } })

export const CheckItemLabel = styled("label", {
  base: {
    display: "flex",
    width: "full",
    height: "full",
    "input:not(:disabled) + &": {
      cursor: "pointer",
    },
  },
})

export const CheckItemIconWrapper = styled("i", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.75rem",
  },
})
