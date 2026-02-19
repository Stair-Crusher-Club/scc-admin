"use client"

import { useParams, useRouter } from "next/navigation"

import { Contents } from "@/components/layout"

import { SuggestionDetailContent } from "../SuggestionDetailContent"

export default function AccessibilitySuggestionDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  return (
    <Contents.Normal>
      <SuggestionDetailContent
        id={id}
        onClose={() => router.push("/accessibility-suggestion")}
        onDeleted={() => router.push("/accessibility-suggestion")}
      />
    </Contents.Normal>
  )
}
