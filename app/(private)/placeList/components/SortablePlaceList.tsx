"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlaceItem {
  placeId: string
  name: string
  address?: string | null
}

interface SortablePlaceListProps<T extends PlaceItem> {
  items: T[]
  onReorder: (items: T[]) => void
  onRemove: (placeId: string) => void
}

function SortableItem({
  item,
  onRemove,
}: {
  item: PlaceItem
  onRemove: (placeId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.placeId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-3 py-2 border rounded-md bg-white"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          ref={setActivatorNodeRef}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <span className="font-medium">{item.name}</span>
          {item.address && (
            <span className="text-sm text-muted-foreground ml-2">
              {item.address}
            </span>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.placeId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function SortablePlaceList<T extends PlaceItem>({
  items,
  onReorder,
  onRemove,
}: SortablePlaceListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.placeId === active.id)
    const newIndex = items.findIndex((item) => item.placeId === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.placeId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem
              key={item.placeId}
              item={item}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
