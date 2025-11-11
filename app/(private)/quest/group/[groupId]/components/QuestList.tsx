import { ClubQuestDTO } from "@/lib/generated-sources/openapi"
import { styled } from "@/styles/jsx"

interface QuestListProps {
  quests: ClubQuestDTO[]
  questColorMap: Map<string, string>
  moveMode: boolean
  onQuestClick: (questId: string) => void
}

export default function QuestList({
  quests,
  questColorMap,
  moveMode,
  onQuestClick,
}: QuestListProps) {
  return (
    <Container>
      <Title>퀘스트 목록 ({quests.length})</Title>
      {moveMode && <ModeIndicator>옮길 퀘스트를 선택하세요</ModeIndicator>}
      <List>
        {quests.map((quest) => (
          <QuestItem
            key={quest.id}
            onClick={() => moveMode && onQuestClick(quest.id)}
            style={{
              cursor: moveMode ? "pointer" : "default",
              opacity: moveMode ? 1 : 0.9,
            }}
          >
            <ColorIndicator style={{ backgroundColor: questColorMap.get(quest.id) }} />
            <QuestInfo>
              <QuestName>{quest.name}</QuestName>
              <QuestStats>
                건물: {quest.buildings.length}개 | 장소:{" "}
                {quest.buildings.reduce((sum, b) => sum + b.places.length, 0)}개
              </QuestStats>
            </QuestInfo>
          </QuestItem>
        ))}
      </List>
    </Container>
  )
}

const Container = styled("div", {
  base: {
    padding: "16px",
  },
})

const Title = styled("h3", {
  base: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "12px",
    color: "#333",
  },
})

const ModeIndicator = styled("div", {
  base: {
    padding: "8px 12px",
    marginBottom: "12px",
    backgroundColor: "#FFF3CD",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#856404",
    textAlign: "center",
    fontWeight: 500,
  },
})

const List = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
})

const QuestItem = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    transition: "all 0.2s",
    _hover: {
      backgroundColor: "#f5f5f5",
      borderColor: "#ccc",
    },
  },
})

const ColorIndicator = styled("div", {
  base: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    flexShrink: 0,
  },
})

const QuestInfo = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
  },
})

const QuestName = styled("div", {
  base: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

const QuestStats = styled("div", {
  base: {
    fontSize: "12px",
    color: "#666",
  },
})
