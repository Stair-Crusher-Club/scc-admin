"use client"

import {
  CheckCircle2Icon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
  SparklesIcon,
  HelpCircleIcon,
} from "lucide-react"

import { ResultTypeDTO, InspectorTypeDTO } from "@/lib/generated-sources/openapi"

import { Badge } from "@/components/ui/badge"

export function ResultTypeBadge({ resultType }: { resultType: ResultTypeDTO }) {
  const getResultIcon = (resultType: ResultTypeDTO) => {
    switch (resultType) {
      case "OK":
        return (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        )
      case "MODIFY":
        return <PencilIcon className="text-blue-500 dark:text-blue-400" />
      case "DELETE":
        return <Trash2Icon className="text-red-500 dark:text-red-400" />
      case "UNKNOWN":
        return <HelpCircleIcon className="text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <Badge
      variant="outline"
      className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3 w-fit"
    >
      {getResultIcon(resultType)}
      {resultType}
    </Badge>
  )
}

export function InspectorTypeBadge({
  inspectorType,
}: {
  inspectorType: InspectorTypeDTO
}) {
  const getInspectorIcon = (inspectorType: InspectorTypeDTO) => {
    switch (inspectorType) {
      case "HUMAN":
        return <UserIcon className="text-blue-500 dark:text-blue-400" />
      case "AI":
        return <SparklesIcon className="text-purple-500 dark:text-purple-400" />
      case "UNKNOWN":
        return <HelpCircleIcon className="text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <Badge
      variant="outline"
      className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3 w-fit"
    >
      {getInspectorIcon(inspectorType)}
      {inspectorType}
    </Badge>
  )
}

