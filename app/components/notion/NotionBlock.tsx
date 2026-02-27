"use client"

import { useQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { useState } from "react"
import { NotionRichText } from "./NotionRichText"
import { NotionDatabase } from "./NotionDatabase"

// Lazy load to break circular dependency: NotionBlock -> NotionRenderer -> NotionBlock
const LazyNotionRenderer = dynamic(() =>
  import("./NotionRenderer").then((mod) => ({ default: mod.NotionRenderer })),
)

function getRichText(block: any): any[] {
  return block[block.type]?.rich_text ?? []
}

function ToggleBlock({ block }: { block: any }) {
  const [opened, setOpened] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["notion-toggle-children", block.id],
    queryFn: async () => {
      const res = await fetch(`/notion/blocks/${block.id}`)
      if (!res.ok) throw new Error("Failed to fetch toggle children")
      return res.json()
    },
    enabled: opened && block.has_children === true,
  })

  return (
    <details
      className="my-1"
      onToggle={(e) => setOpened((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer leading-relaxed">
        <NotionRichText richText={getRichText(block)} />
      </summary>
      <div className="pl-5 pt-1">
        {isLoading && (
          <p className="text-sm text-gray-400">불러오는 중...</p>
        )}
        {data?.blocks && <LazyNotionRenderer blocks={data.blocks} />}
      </div>
    </details>
  )
}

export function NotionBlock({ block }: { block: any }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-1 leading-relaxed">
          <NotionRichText richText={getRichText(block)} />
        </p>
      )

    case "heading_1":
      return (
        <h1 className="mb-2 mt-6 text-2xl font-bold">
          <NotionRichText richText={getRichText(block)} />
        </h1>
      )

    case "heading_2":
      return (
        <h2 className="mb-2 mt-5 text-xl font-semibold">
          <NotionRichText richText={getRichText(block)} />
        </h2>
      )

    case "heading_3":
      return (
        <h3 className="mb-1 mt-4 text-lg font-semibold">
          <NotionRichText richText={getRichText(block)} />
        </h3>
      )

    case "bulleted_list_item":
      return (
        <li className="ml-1 leading-relaxed">
          <NotionRichText richText={getRichText(block)} />
        </li>
      )

    case "numbered_list_item":
      return (
        <li className="ml-1 leading-relaxed">
          <NotionRichText richText={getRichText(block)} />
        </li>
      )

    case "to_do": {
      const checked = block.to_do?.checked ?? false
      return (
        <div className="my-1 flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 h-4 w-4 cursor-default"
          />
          <span className={checked ? "line-through text-gray-400" : ""}>
            <NotionRichText richText={getRichText(block)} />
          </span>
        </div>
      )
    }

    case "toggle":
      return <ToggleBlock block={block} />

    case "divider":
      return <hr className="my-4 border-gray-200" />

    case "child_database":
      return (
        <NotionDatabase
          databaseId={block.id}
          title={block.child_database?.title ?? ""}
        />
      )

    case "callout": {
      const icon = block.callout?.icon
      const iconEmoji = icon?.type === "emoji" ? icon.emoji : null
      return (
        <div className="my-2 flex gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          {iconEmoji && <span className="text-xl">{iconEmoji}</span>}
          <div className="flex-1">
            <NotionRichText richText={getRichText(block)} />
          </div>
        </div>
      )
    }

    case "quote":
      return (
        <blockquote className="my-2 border-l-[3px] border-gray-900 pl-4 italic">
          <NotionRichText richText={getRichText(block)} />
        </blockquote>
      )

    case "image": {
      const image = block.image
      const url =
        image?.type === "external"
          ? image.external?.url
          : image?.type === "file"
            ? image.file?.url
            : null
      if (!url) return null
      const caption = image?.caption ?? []
      return (
        <figure className="my-4">
          <img
            src={url}
            alt={caption.map((c: any) => c.plain_text).join("") || ""}
            className="max-w-full rounded"
          />
          {caption.length > 0 && (
            <figcaption className="mt-1 text-center text-sm text-gray-500">
              <NotionRichText richText={caption} />
            </figcaption>
          )}
        </figure>
      )
    }

    case "bookmark": {
      const url = block.bookmark?.url
      if (!url) return null
      return (
        <div className="my-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded border border-gray-200 p-3 text-blue-600 underline hover:bg-gray-50"
          >
            {url}
          </a>
        </div>
      )
    }

    case "code": {
      const language = block.code?.language ?? ""
      return (
        <pre className="my-2 overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">
          <code data-language={language}>
            {(block.code?.rich_text ?? [])
              .map((t: any) => t.plain_text)
              .join("")}
          </code>
        </pre>
      )
    }

    default:
      return null
  }
}
