import { styled } from "@/styles/jsx"

export const LoginPage = styled("div", {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'full',
  }
})

export const Form = styled("form", {
  base: {
    width: 200,
  }
})
export const LoginButton = styled("button", {
  base: {
    width: "100%",
    backgroundColor: "var(--leaf-primary-60)",
    padding: 4,
    color: "white",
    cursor: "pointer",
  },
})
