import { Flex } from "@/styles/jsx"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex align="center" justify="center" height="full">
      {children}
    </Flex>
  )
}
