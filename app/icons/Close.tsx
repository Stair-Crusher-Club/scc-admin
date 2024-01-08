interface IconProps {
  size?: number
  color?: string
}
export default function Close({ size = 32, color = "black" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M7 7L25 25M7 25L25 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
