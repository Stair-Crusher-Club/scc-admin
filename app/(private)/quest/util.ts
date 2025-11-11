
export function getQuestGroupName(questName: string): string | undefined {
  return questName.split(" - ")[0]
}
