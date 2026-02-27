"use client"

interface RichText {
  type: string
  text: { content: string; link: { url: string } | null }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href: string | null
}

const notionColorMap: Record<string, string> = {
  gray: "#787774",
  brown: "#9F6B53",
  orange: "#D9730D",
  yellow: "#CB912F",
  green: "#448361",
  blue: "#337EA9",
  purple: "#9065B0",
  pink: "#C14C8A",
  red: "#D44C47",
  gray_background: "#F1F1EF",
  brown_background: "#F4EEEE",
  orange_background: "#FBECDD",
  yellow_background: "#FBF3DB",
  green_background: "#EDF3EC",
  blue_background: "#E7F3F8",
  purple_background: "#F6F3F9",
  pink_background: "#F9F0F5",
  red_background: "#FDEBEC",
}

// Notion API strips U+FE0F (variation selector-16) from keycap sequences like 1⃣.
// Without it, browsers render text-style "1⃣" instead of emoji-style "1️⃣".
// This inserts U+FE0F before U+20E3 (combining enclosing keycap) when missing.
function fixKeycapEmoji(text: string): string {
  return text.replace(/([0-9#*])\u20E3/g, "$1\uFE0F\u20E3")
}

export function NotionRichText({ richText }: { richText: RichText[] }) {
  if (!richText || richText.length === 0) return null

  return (
    <>
      {richText.map((item, index) => {
        const { annotations, href } = item
        const rawText = fixKeycapEmoji(item.text?.content ?? item.plain_text ?? "")

        // Render \n (shift+enter line breaks) as <br/>
        let element: React.ReactNode = rawText.includes("\n")
          ? rawText.split("\n").flatMap((line, i, arr) =>
              i < arr.length - 1 ? [line, <br key={`br-${i}`} />] : [line],
            )
          : rawText

        if (annotations.code) {
          element = (
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-red-600">
              {element}
            </code>
          )
        }
        if (annotations.bold) {
          element = <strong>{element}</strong>
        }
        if (annotations.italic) {
          element = <em>{element}</em>
        }
        if (annotations.underline) {
          element = <u>{element}</u>
        }
        if (annotations.strikethrough) {
          element = <s>{element}</s>
        }

        const style: React.CSSProperties = {}
        if (annotations.color && annotations.color !== "default") {
          const colorKey = annotations.color
          if (colorKey.endsWith("_background")) {
            style.backgroundColor = notionColorMap[colorKey] ?? undefined
          } else {
            style.color = notionColorMap[colorKey] ?? undefined
          }
        }

        if (href) {
          element = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
              style={style}
            >
              {element}
            </a>
          )
        } else if (Object.keys(style).length > 0) {
          element = <span style={style}>{element}</span>
        }

        return <span key={index}>{element}</span>
      })}
    </>
  )
}
