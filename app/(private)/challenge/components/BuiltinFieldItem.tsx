import { AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO } from "@/lib/generated-sources/openapi"
import { css } from "@/styles/css"
import OptionsControl from "./OptionsControl"
import { FormField, BuiltinFieldOption } from "./B2bFormTypes"

interface BuiltinFieldItemProps {
  option: BuiltinFieldOption
  field: FormField | undefined
  isChecked: boolean
  onToggle: (fieldName: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onUpdateOptionsText: (fieldId: string, text: string) => void
  onToggleOptions: (fieldId: string, enabled: boolean) => void
  disabled?: boolean
}

export default function BuiltinFieldItem({
  option,
  field,
  isChecked,
  onToggle,
  onUpdateField,
  onUpdateOptionsText,
  onToggleOptions,
  disabled = false,
}: BuiltinFieldItemProps) {
  return (
    <div
      className={css({
        padding: "12px",
        backgroundColor: isChecked ? "#ffffff" : "transparent",
        borderRadius: "6px",
        border: isChecked ? "1px solid #d1d5db" : "1px solid transparent",
      })}
    >
      <label className={css({ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" })}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(option.value)}
          disabled={disabled}
          className={css({
            width: "16px",
            height: "16px",
            cursor: "pointer",
            _disabled: { cursor: "not-allowed" },
          })}
        />
        <span className={css({ fontSize: "13px", fontWeight: "500" })}>
          {option.label}{" "}
          <span className={css({ color: "#9ca3af", fontSize: "11px" })}>({option.value})</span>
        </span>
      </label>

      {isChecked && field && (
        <div
          className={css({
            marginTop: "12px",
            marginLeft: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          })}
        >
          {/* Custom Display Name Override */}
          <div>
            <label
              className={css({
                fontSize: "11px",
                color: "#6b7280",
                display: "block",
                marginBottom: "4px",
              })}
            >
              사용자 정의 표시명 (선택사항)
            </label>
            <input
              type="text"
              value={field.customDisplayName || ""}
              onChange={(e) =>
                onUpdateField(field.id, {
                  customDisplayName: e.target.value || undefined,
                })
              }
              placeholder={`기본값: ${option.label}`}
              disabled={disabled}
              className={css({
                width: "100%",
                padding: "6px 10px",
                fontSize: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                _focus: {
                  outline: "none",
                  borderColor: "#3b82f6",
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
                },
                _disabled: {
                  backgroundColor: "#f3f4f6",
                  color: "#9ca3af",
                  cursor: "not-allowed",
                },
              })}
            />
          </div>

          {/* Options Control */}
          <OptionsControl
            field={field}
            onToggle={onToggleOptions}
            onUpdateText={onUpdateOptionsText}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
