import { css } from "@/styles/css"
import { FormField } from "./B2bFormTypes"

interface OptionsControlProps {
  field: FormField
  onToggle: (fieldId: string, enabled: boolean) => void
  onUpdateText: (fieldId: string, text: string) => void
  disabled?: boolean
}

export default function OptionsControl({
  field,
  onToggle,
  onUpdateText,
  disabled = false,
}: OptionsControlProps) {
  return (
    <div>
      <label className={css({ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" })}>
        <input
          type="checkbox"
          checked={field.options !== null}
          onChange={(e) => onToggle(field.id, e.target.checked)}
          disabled={disabled}
          className={css({
            width: "14px",
            height: "14px",
            cursor: "pointer",
            _disabled: { cursor: "not-allowed" },
          })}
        />
        <span className={css({ fontSize: "12px", color: "#374151" })}>객관식으로 만들기</span>
      </label>

      {field.options !== null && (
        <div className={css({ marginTop: "8px" })}>
          <input
            type="text"
            value={field.optionsText}
            onChange={(e) => onUpdateText(field.id, e.target.value)}
            placeholder="옵션을 쉼표로 구분하여 입력 (예: 삼성, LG, 현대)"
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

          {/* Options Preview */}
          {field.options && field.options.length > 0 && (
            <div className={css({ marginTop: "6px" })}>
              <div className={css({ fontSize: "10px", color: "#6b7280", marginBottom: "4px" })}>
                미리보기 ({field.options.length}개):
              </div>
              <div className={css({ display: "flex", flexWrap: "wrap", gap: "4px" })}>
                {field.options.map((opt, idx) => (
                  <span
                    key={idx}
                    className={css({
                      padding: "2px 8px",
                      fontSize: "11px",
                      backgroundColor: "#e5e7eb",
                      color: "#374151",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                    })}
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
