interface IconProps {
  size?: number
  color?: string
}
export default function Reload({ size, color = "black" }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} fill="none">
      <path
        fill={color}
        d="M31.5 4.47a27.3 27.3 0 0 0-14.7 4.28L11.05 3v16.11h16.11l-6.4-6.4A21.83 21.83 0 0 1 31.5 9.9a22.1 22.1 0 0 1 22.07 22.08c0 2.9-.57 5.66-1.6 8.2l4.74 2.76A27.53 27.53 0 0 0 31.5 4.46ZM42.23 51.22a21.82 21.82 0 0 1-10.73 2.82A22.1 22.1 0 0 1 9.43 31.97c0-2.74.52-5.35 1.44-7.77l-4.73-2.85A27.53 27.53 0 0 0 31.5 59.47c5.4 0 10.43-1.59 14.7-4.29l5.75 5.76V44.83H35.84l6.39 6.39Z"
      />
    </svg>
  )
}
