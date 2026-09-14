import { endOfDay, format, parseISO } from "date-fns"

// <input type="date"> 값("yyyy-MM-dd")을 new Date(string)로 직접 파싱하면 ECMAScript 사양상
// UTC 자정으로 해석돼 KST(+9)에서 최대 9시간이 밀린다(예: 종료일 09-30 선택 시 실제로는 09-30 09:00에 만료).
// parseISO는 date-only 문자열을 로컬 자정으로 해석하므로 이를 통해 로컬 자정/끝을 얻는다.
export function parseDateInputAsStartOfDay(value: string): number {
  return parseISO(value).getTime()
}

export function parseDateInputAsEndOfDay(value: string): number {
  return endOfDay(parseISO(value)).getTime()
}

// epoch millis → <input type="date"> 가 요구하는 "yyyy-MM-dd" (format은 로컬 기준이라 위 두 함수와 왕복이 맞는다)
export function toDateInputValue(epochMillis: number): string {
  return format(new Date(epochMillis), "yyyy-MM-dd")
}
