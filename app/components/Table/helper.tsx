export function renderEllipsis(fixedWidth: number) {
  return function ellipsis(text: string) {
    return (
      <span
        title={text}
        style={{ display: "inline-block", width: fixedWidth, overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {text}
      </span>
    )
  }
}

export function renderMultiline() {
  return function multiline(text: string) {
    return <p style={{ textAlign: "left", whiteSpace: "pre-line" }}>{text}</p>
  }
}
