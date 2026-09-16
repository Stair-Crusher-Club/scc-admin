"use client"

import { Textarea } from "@/components/ui/textarea"

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

// 서버(validateMarkerSvg)가 create/update 시점에 <script>/on*=/javascript: 를 이미 거부하므로 이 값은
// 저장 완료본이거나 저장 전 입력 중인 값이다. 여기서는 <script 포함 시에만 미리보기를 막는다 —
// 그 외 이벤트 핸들러 속성 검증은 서버 책임(중복 검증 금지).
function isPreviewable(svg: string): boolean {
  return svg.startsWith("<svg") && !/<script/i.test(svg)
}

export function MarkerSvgInput({ label, value, onChange, disabled, placeholder }: Props) {
  const trimmed = value.trim()

  return (
    <div className="flex gap-3 items-start">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={placeholder}
          disabled={disabled}
          className="font-mono text-xs"
        />
      </div>
      <div className="w-20 h-20 shrink-0 border rounded-md flex items-center justify-center bg-white mt-7">
        {trimmed && isPreviewable(trimmed) ? (
          <div
            className="w-16 h-16 [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: trimmed }}
          />
        ) : (
          <span className="text-[10px] text-muted-foreground text-center px-1">
            {trimmed ? "미리보기 불가" : "미리보기"}
          </span>
        )}
      </div>
    </div>
  )
}
