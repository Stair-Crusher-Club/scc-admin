import { AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO } from "@/lib/generated-sources/openapi"
import { css } from "@/styles/css"
import BuiltinFieldItem from "./BuiltinFieldItem"
import CustomFieldItem from "./CustomFieldItem"
import { FormField, BuiltinFieldOption } from "./B2bFormTypes"

interface B2bFormSchemaPanelProps {
  formFields: FormField[]
  availableFieldOptions: BuiltinFieldOption[]
  onToggleBuiltinField: (fieldName: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onUpdateOptionsText: (fieldId: string, text: string) => void
  onToggleOptions: (fieldId: string, enabled: boolean) => void
  onAddCustomField: () => void
  onRemoveField: (fieldId: string) => void
  disabled?: boolean
}

export default function B2bFormSchemaPanel({
  formFields,
  availableFieldOptions,
  onToggleBuiltinField,
  onUpdateField,
  onUpdateOptionsText,
  onToggleOptions,
  onAddCustomField,
  onRemoveField,
  disabled = false,
}: B2bFormSchemaPanelProps) {
  return (
    <div
      className={css({
        marginTop: "12px",
        marginLeft: "26px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
      })}
    >
      <div className={css({ fontSize: "14px", fontWeight: "600", marginBottom: "4px" })}>
        B2B 챌린지 참가 시 입력 필드 설정
      </div>
      <div className={css({ fontSize: "12px", color: "#6b7280", marginBottom: "16px" })}>
        참가자가 입력할 수 있는 필드를 선택하고 설정하세요.
      </div>

      {/* Built-in Fields Section */}
      <div className={css({ marginBottom: "20px" })}>
        <div
          className={css({
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "12px",
            color: "#374151",
          })}
        >
          기본 제공 필드
        </div>
        <div className={css({ display: "flex", flexDirection: "column", gap: "16px" })}>
          {availableFieldOptions.map((option) => {
            const field = formFields.find(
              (f) => f.type === "builtin" && f.builtinName === option.value
            )
            const isChecked = !!field

            return (
              <BuiltinFieldItem
                key={option.value}
                option={option}
                field={field}
                isChecked={isChecked}
                onToggle={onToggleBuiltinField}
                onUpdateField={onUpdateField}
                onUpdateOptionsText={onUpdateOptionsText}
                onToggleOptions={onToggleOptions}
                disabled={disabled}
              />
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className={css({ height: "1px", backgroundColor: "#d1d5db", marginY: "20px" })} />

      {/* Custom Questions Section */}
      <div>
        <div
          className={css({
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "12px",
            color: "#374151",
          })}
        >
          사용자 정의 질문
        </div>

        {/* Custom Fields List */}
        {formFields
          .filter((f) => f.type === "custom")
          .map((field, index) => (
            <CustomFieldItem
              key={field.id}
              field={field}
              index={index}
              onUpdate={onUpdateField}
              onRemove={onRemoveField}
              onUpdateOptionsText={onUpdateOptionsText}
              onToggleOptions={onToggleOptions}
              disabled={disabled}
            />
          ))}

        {/* Add Custom Question Button */}
        <button
          type="button"
          onClick={onAddCustomField}
          disabled={disabled}
          className={css({
            width: "100%",
            padding: "10px",
            fontSize: "13px",
            color: "#3b82f6",
            backgroundColor: "#ffffff",
            border: "2px dashed #3b82f6",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            _hover: {
              backgroundColor: "#eff6ff",
            },
            _disabled: {
              cursor: "not-allowed",
              opacity: 0.5,
              color: "#9ca3af",
              borderColor: "#d1d5db",
            },
          })}
        >
          + 사용자 정의 질문 추가
        </button>
      </div>
    </div>
  )
}
