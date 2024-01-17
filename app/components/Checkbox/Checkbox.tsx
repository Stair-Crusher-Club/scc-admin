import Check from "@/icons/Check"

import * as S from "./Checkbox.style"

interface Props {
  id: string
  checked: true | false | "notAll"
  onChange?: (checked: boolean) => void
  disabled?: boolean
  readOnly?: boolean
  style?: React.CSSProperties
}
export default function Checkbox({ id, checked, onChange, readOnly, disabled, style }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (readOnly) return
    onChange?.(e.currentTarget.checked)
  }

  return (
    <S.CheckBox disabled={disabled} checked={checked} style={style}>
      <S.CheckItemInput id={id} checked={checked === true} disabled={disabled} onChange={handleChange} />
      <S.CheckItemLabel htmlFor={id}>
        <S.CheckItemIconWrapper>
          <Check size="100%" />
        </S.CheckItemIconWrapper>
      </S.CheckItemLabel>
    </S.CheckBox>
  )
}
