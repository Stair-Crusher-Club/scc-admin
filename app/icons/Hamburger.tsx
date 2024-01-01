interface IconProps {
  size?: number
  color?: string
}
export default function Hamburger({ size = 32, color = "white" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M 4 10 L 28 10" stroke={color} strokeWidth={2} />
      <path d="M 4 16 L 28 16" stroke={color} strokeWidth={2} />
      <path d="M 4 22 L 28 22" stroke={color} strokeWidth={2} />
    </svg>
  )
}
