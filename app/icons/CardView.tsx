interface IconProps {
  size?: number
  color?: string
}
export default function CardView({ size = 32, color = "white" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <g stroke={color}>
        <rect x="7" y="7" width="50" height="12" rx="3" stroke="black" strokeWidth="4" />
        <rect x="7" y="26" width="50" height="12" rx="3" stroke="black" strokeWidth="4" />
        <rect x="7" y="45" width="50" height="12" rx="3" stroke="black" strokeWidth="4" />
      </g>
    </svg>
  )
}
