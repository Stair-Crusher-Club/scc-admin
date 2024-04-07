import { styled } from "@/styles/jsx"

// 기본 <Contents />는 아무 스타일도 입히지 않는다
function Contents({ children }: { children: React.ReactNode }) {
  return children
}

Contents.Normal = styled("main", {
  base: { width: "fit-content", padding: 32 },
})

export default Contents
