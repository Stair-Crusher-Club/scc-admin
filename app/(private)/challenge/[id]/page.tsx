"use client"

import { useParams } from "next/navigation"

import { useChallenge } from "@/lib/apis/api"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const { data: challenge } = useChallenge({ id })
  console.log(challenge)
  return null
}
