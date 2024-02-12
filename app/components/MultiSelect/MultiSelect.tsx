import { Controller, UseControllerProps } from "react-hook-form"
import Select from "react-select"

interface Props extends React.ComponentProps<typeof Select> {
  name: string
  label?: string
  rules?: UseControllerProps["rules"]
}

export default function MultiSelect({ name, label, rules, ...props }: Props) {
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="leaf-input-container">
          <div className="leaf-label-area">
            <label className="leaf-label">{label}</label>
          </div>
          <Select
            isMulti
            value={field.value}
            onChange={(v) => field.onChange(v)}
            styles={{
              control: (base, props) => ({
                ...base,
                boxShadow: "none",
                borderColor: props.isFocused ? "var(--leaf-primary-60)" : "var(--leaf-grey-80)",
                "&:hover": { borderColor: props.isFocused ? "var(--leaf-primary-60)" : "var(--leaf-grey-70)" },
              }),
              placeholder: (base) => ({ ...base, color: "var(--leaf-grey-80)" }),
              dropdownIndicator: (base, props) => ({
                ...base,
                color: props.isFocused ? "var(--leaf-primary-60)" : "var(--leaf-grey-80)",
                "&:hover": {
                  color: props.isFocused ? "var(--leaf-primary-60)" : "var(--leaf-grey-70)",
                },
              }),
            }}
            {...props}
          />
          <div className="leaf-extra-area">
            <p className="leaf-error-message leaf-desc">{fieldState.error?.message}</p>
          </div>
        </div>
      )}
    />
  )
}
