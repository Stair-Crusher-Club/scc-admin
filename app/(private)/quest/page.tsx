"use client"

import { useQuests } from "@/lib/apis/api"

export default function QuestList() {
  const { data } = useQuests()
  const quests = data ?? []

  return (
    <main>
      <ul>
        {quests.map((q) => (
          <li key={q.id}>{q.name}</li>
        ))}
      </ul>
      <div>Quest List</div>
    </main>
  )
}
