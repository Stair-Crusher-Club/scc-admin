"use client"

import { NotionBlock } from "./NotionBlock"

interface GroupedItem {
  type: "single" | "bulleted_list" | "numbered_list"
  blocks: any[]
}

function groupBlocks(blocks: any[]): GroupedItem[] {
  const groups: GroupedItem[] = []

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      const last = groups[groups.length - 1]
      if (last && last.type === "bulleted_list") {
        last.blocks.push(block)
      } else {
        groups.push({ type: "bulleted_list", blocks: [block] })
      }
    } else if (block.type === "numbered_list_item") {
      const last = groups[groups.length - 1]
      if (last && last.type === "numbered_list") {
        last.blocks.push(block)
      } else {
        groups.push({ type: "numbered_list", blocks: [block] })
      }
    } else {
      groups.push({ type: "single", blocks: [block] })
    }
  }

  return groups
}

export function NotionRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null

  const groups = groupBlocks(blocks)

  return (
    <div className="notion-content">
      {groups.map((group, index) => {
        if (group.type === "bulleted_list") {
          return (
            <ul key={index} className="my-2 list-disc pl-6">
              {group.blocks.map((block) => (
                <NotionBlock key={block.id} block={block} />
              ))}
            </ul>
          )
        }
        if (group.type === "numbered_list") {
          return (
            <ol key={index} className="my-2 list-decimal pl-6">
              {group.blocks.map((block) => (
                <NotionBlock key={block.id} block={block} />
              ))}
            </ol>
          )
        }
        const block = group.blocks[0]
        return <NotionBlock key={block.id} block={block} />
      })}
    </div>
  )
}
