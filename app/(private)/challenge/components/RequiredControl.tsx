import { css } from "@/styles/css"
import { FormField } from "./B2bFormTypes"

interface RequiredControlProps {
  field: FormField
  onToggle: (fieldId: string, isRequired: boolean) => void
  disabled?: boolean
}

export default function RequiredControl({
  field,
  onToggle,
  disabled = false,
}: RequiredControlProps) {
  return (
    <label className={css({ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" })}>
      <input
        type="checkbox"
        checked={field.isRequired}
        onChange={(e) => onToggle(field.id, e.target.checked)}
        disabled={disabled}
        className={css({
          width: "14px",
          height: "14px",
          cursor: "pointer",
          _disabled: { cursor: "not-allowed" },
        })}
      />
      <span className={css({ fontSize: "12px", color: "#374151" })}>
        필수 입력 <span className={css({ color: "#9ca3af", fontSize: "11px" })}>(체크 해제 시 선택 입력)</span>
      </span>
    </label>
  )
}
