import { Controller, UseControllerProps } from "react-hook-form"
import Creatable from "react-select/creatable"

interface Props {
  name: string
  options: unknown[]
  label?: string
  placeholder?: string
  rules?: UseControllerProps["rules"]
}
export default function Autocomplete({ name, options, label, placeholder, rules }: Props) {
  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field, fieldState, formState }) => (
        <div className="leaf-input-container">
          <div className="leaf-label-area">
            <label className="leaf-label">{label}</label>
          </div>
          <Creatable
            isMulti
            value={field.value}
            onChange={(v) => field.onChange(v)}
            placeholder={placeholder}
            options={options}
            styles={{
              control: (base, props) => ({
                ...base,
                boxShadow: "none",
                borderColor: props.isFocused
                  ? "var(--leaf-primary-60)"
                  : fieldState.error
                    ? "var(--leaf-status-red)"
                    : "var(--leaf-grey-80)",
                "&:hover": {
                  borderColor: props.isFocused
                    ? "var(--leaf-primary-60)"
                    : fieldState.error
                      ? "var(--leaf-status-red)"
                      : "var(--leaf-grey-70)",
                },
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
          />
          <div className="leaf-extra-area">
            <p className="leaf-error-message leaf-desc">{fieldState.error?.message}</p>
          </div>
        </div>
      )}
    />
  )
}
