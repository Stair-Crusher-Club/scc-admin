import { SystemStyleObject } from "@pandacss/dev"
import localFont from "next/font/local"
import { PropsWithChildren } from "react"

import { styled } from "@/styles/jsx"

const pretendard = localFont({
  src: "../../../../public/fonts/Pretendard.ttf",
})

interface GuideTypographyProps extends PropsWithChildren {
  variant: "title" | "subtitle" | "description"
  css?: SystemStyleObject
}

export default function GuideTypography({ children, variant, css }: GuideTypographyProps) {
  const Component = variants[variant]
  return (
    <Component className={pretendard.className} css={css}>
      {children}
    </Component>
  )
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
