import { PropsWithChildren } from "react"

import { styled } from "@/styles/jsx"

interface GuideTypographyProps extends PropsWithChildren {
  variant: "title" | "subtitle" | "description"
}

export default function GuideTypography({ children, variant }: GuideTypographyProps) {
  const Component = variants[variant]
  return <Component>{children}</Component>
}

const variants = {
  title: styled("h2", {
    base: {
      fontSize: 22,
      fontWeight: "bold",
      lineHeight: "140%",
    },
  }),
  subtitle: styled("h3", {
    base: {
      fontSize: 18,
      fontWeight: "semibold",
      lineHeight: "140%",
    },
  }),
  description: styled("p", {
    base: {
      fontSize: 14,
      color: "#6A6A73",
      lineHeight: "150%",
    },
  }),
}
