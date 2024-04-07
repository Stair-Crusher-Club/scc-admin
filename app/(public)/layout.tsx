import { Flex } from "@/styles/jsx"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex css={{ width: "full", height: "full" }}>
      <Flex direction="column" css={{ width: "full", overflow: "auto" }}>
        {children}
      </Flex>
    </Flex>
  )
}
