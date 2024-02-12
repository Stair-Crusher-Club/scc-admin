import { format } from "date-fns"
import ko from "date-fns/locale/ko"
import DatePicker, { registerLocale } from "react-datepicker"
import { Controller, useFormContext } from "react-hook-form"

import Calendar from "@/icons/Calendar"

registerLocale("ko", ko)

interface Props {
  name: string
  label?: string
  placeholder?: string
}

/** hook form connected */
export default function DateInput({ name, label, placeholder }: Props) {
  const form = useFormContext()

  return (
    <div className="leaf-input-container">
      <div className="leaf-label-area">
        <label className="leaf-label">{label}</label>
      </div>
      <Controller
        name={name}
        render={({ field }) => (
          <DatePicker
            wrapperClassName="leaf-input-container"
            placeholderText={placeholder}
            className="leaf-input"
            locale="ko"
            isClearable
            showTimeSelect
            withPortal
            showIcon
            icon={<Calendar className="react-datepicker__calendar-icon" color="black" />}
            value={field.value}
            onChange={(d) => (d ? field.onChange(format(d, "yyyy-MM-dd HH:mm")) : "")}
            dateFormatCalendar={"yyyy MMM"}
            timeCaption="시각"
            fixedHeight
          />
        )}
      />
      <div className="leaf-extra-area" />
    </div>
  )
}
