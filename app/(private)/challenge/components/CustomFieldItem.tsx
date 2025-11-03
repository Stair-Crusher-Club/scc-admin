import { css } from "@/styles/css"
import OptionsControl from "./OptionsControl"
import { FormField } from "./B2bFormTypes"

interface CustomFieldItemProps {
  field: FormField
  index: number
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onRemove: (fieldId: string) => void
  onUpdateOptionsText: (fieldId: string, text: string) => void
  onToggleOptions: (fieldId: string, enabled: boolean) => void
  disabled?: boolean
}

export default function CustomFieldItem({
  field,
  index,
  onUpdate,
  onRemove,
  onUpdateOptionsText,
  onToggleOptions,
  disabled = false,
}: CustomFieldItemProps) {
  return (
    <div
      className={css({
        padding: "12px",
        marginBottom: "12px",
        backgroundColor: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
      })}
    >
      {/* Header with delete button */}
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        })}
      >
        <div className={css({ fontSize: "12px", fontWeight: "600", color: "#374151" })}>
          Custom Question #{index + 1}
        </div>
        <button
          type="button"
          onClick={() => onRemove(field.id)}
          disabled={disabled}
          className={css({
            padding: "4px 8px",
            fontSize: "11px",
            color: "#dc2626",
            backgroundColor: "transparent",
            border: "1px solid #dc2626",
            borderRadius: "4px",
            cursor: "pointer",
            _hover: {
              backgroundColor: "#fee2e2",
            },
            _disabled: {
              cursor: "not-allowed",
              opacity: 0.5,
            },
          })}
        >
          × 삭제
        </button>
      </div>

      <div className={css({ display: "flex", flexDirection: "column", gap: "10px" })}>
        {/* Key (Editable) */}
        <div>
          <label
            className={css({
              fontSize: "11px",
              color: "#6b7280",
              display: "block",
              marginBottom: "4px",
            })}
          >
            Key (camelCase) <span className={css({ color: "#dc2626" })}>*</span>
          </label>
          <input
            type="text"
            value={field.customKey || ""}
            onChange={(e) => onUpdate(field.id, { customKey: e.target.value })}
            placeholder="예: participationReason"
            disabled={disabled}
            required
            pattern="^[a-z][a-zA-Z0-9]*$"
            title="camelCase 형식으로 입력하세요 (예: customField1, participationReason)"
            className={css({
              width: "100%",
              padding: "6px 10px",
              fontSize: "12px",
              fontFamily: "monospace",
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

        {/* Display Name (Required) */}
        <div>
          <label
            className={css({
              fontSize: "11px",
              color: "#6b7280",
              display: "block",
              marginBottom: "4px",
            })}
          >
            질문 내용 <span className={css({ color: "#dc2626" })}>*</span>
          </label>
          <input
            type="text"
            value={field.customDisplayName || ""}
            onChange={(e) => onUpdate(field.id, { customDisplayName: e.target.value })}
            placeholder="예: 참여 동기를 입력해주세요"
            disabled={disabled}
            required
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
    </div>
  )
}
