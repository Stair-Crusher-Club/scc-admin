interface IconProps {
  className?: string
  size?: number | string
  color?: string
}
export default function Calendar({ className, size = 32, color = "white" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        fill={color}
        d="M7 4a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h14c.8 0 1.7-.3 2.3-.9l3.8-3.8c.6-.6.9-1.5.9-2.3V7a3 3 0 0 0-3-3H7ZM6 7c0-.6.4-1 1-1h18c.6 0 1 .4 1 1v14h-3a2 2 0 0 0-2 2v3H7a1 1 0 0 1-1-1V7Z"
      />
      <path
        fill={color}
        d="M26 11H6v-1h20v1ZM11 17H8v3h3v-3ZM11 21H8v3h3v-3ZM15 13h-3v3h3v-3ZM15 17h-3v3h3v-3ZM15 21h-3v3h3v-3ZM19 13h-3v3h3v-3ZM19 17h-3v3h3v-3ZM23 13h-3v3h3v-3ZM23 17h-3v3h3v-3Z"
      />
    </svg>
  )
}
