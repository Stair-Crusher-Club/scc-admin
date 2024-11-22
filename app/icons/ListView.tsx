interface IconProps {
  size?: number
  color?: string
}
export default function ListView({ size = 32, color = "white" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <g fill={color}>
        <rect x="17" y="10" width="39" height="5" />
        <rect x="17" y="23" width="39" height="5" />
        <rect x="17" y="36" width="39" height="5" />
        <rect x="17" y="49" width="39" height="5" />
        <circle cx="10.5" cy="12.5" r="3.5" />
        <circle cx="10.5" cy="25.5" r="3.5" />
        <circle cx="10.5" cy="38.5" r="3.5" />
        <circle cx="10.5" cy="51.5" r="3.5" />
      </g>
    </svg>
  )
}
