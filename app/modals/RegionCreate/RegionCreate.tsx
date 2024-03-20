import { TextInput } from "@reactleaf/input/hookform"
import { BasicModalProps } from "@reactleaf/modal"
import { FormProvider, useForm } from "react-hook-form"

import RightSheet from "../_template/RightSheet"

interface Props extends BasicModalProps {
  defaultName?: string
  onConfirm?: (name: string) => void
  onCancel?: () => void
}
export default function RegionCreate({ defaultName, onConfirm, onCancel, visible, close }: Props) {
  const form = useForm<{ name: string }>({ defaultValues: { name: defaultName } })

  function onSubmit(value: { name: string }) {
    onConfirm?.(value.name)
    close()
  }

  function handleCancel() {
    onCancel?.()
    close()
  }

  return (
    <RightSheet title="오픈 지역 추가" visible={visible} close={close}>
      <form style={{ width: 260, padding: "0 20px" }} onSubmit={form.handleSubmit(onSubmit)}>
        <FormProvider {...form}>
          <TextInput label="지역명" name="name" />
        </FormProvider>
        <div>
          <button onClick={handleCancel} type="button">
            취소
          </button>
          <button>추가하기</button>
        </div>
      </form>
    </RightSheet>
  )
}
