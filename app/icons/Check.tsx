interface IconProps {
  size?: number | string
  color?: string
}
export default function Check({ size = 32, color = "white" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M 9 16 L 13 21 L 23 11" stroke={color} strokeWidth={2.6} />
    </svg>
  )
}
