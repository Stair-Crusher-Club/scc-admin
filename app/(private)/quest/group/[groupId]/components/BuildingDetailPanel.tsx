import { ClubQuestTargetBuildingDTO } from "@/lib/generated-sources/openapi"
import { styled } from "@/styles/jsx"

interface BuildingDetailPanelProps {
  building: ClubQuestTargetBuildingDTO
  questId: string
  questName: string
  selectedPlaceIds: string[]
  moveMode: boolean
  onDeleteBuilding: (building: ClubQuestTargetBuildingDTO) => void
  onDeletePlace: (placeId: string) => void
  onDeleteSelectedPlaces: () => void
  onTogglePlaceSelection: (placeId: string) => void
  onToggleMoveMode: () => void
  onClose: () => void
}

export default function BuildingDetailPanel({
  building,
  questId,
  questName,
  selectedPlaceIds,
  moveMode,
  onDeleteBuilding,
  onDeletePlace,
  onDeleteSelectedPlaces,
  onTogglePlaceSelection,
  onToggleMoveMode,
  onClose,
}: BuildingDetailPanelProps) {
  return (
    <Container>
      <Header>
        <HeaderContent>
          <QuestName>{questName}</QuestName>
          <Title>{building.name}</Title>
        </HeaderContent>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Header>

      <Content>
        <Section>
          <SectionTitle>건물 관리</SectionTitle>
          <ActionButton
            onClick={() => onDeleteBuilding(building)}
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            건물 삭제
          </ActionButton>
        </Section>

        <Section>
          <SectionTitle>장소 목록 ({building.places.length})</SectionTitle>

          {!moveMode && (
            <ButtonGroup>
              <ActionButton
                onClick={onToggleMoveMode}
                disabled={selectedPlaceIds.length === 0}
                style={{
                  backgroundColor: selectedPlaceIds.length > 0 ? "#1976d2" : "#ccc",
                  color: "#fff",
                }}
              >
                선택한 장소 옮기기 ({selectedPlaceIds.length})
              </ActionButton>
              <ActionButton
                onClick={onDeleteSelectedPlaces}
                disabled={selectedPlaceIds.length === 0}
                style={{
                  backgroundColor: selectedPlaceIds.length > 0 ? "#d32f2f" : "#ccc",
                  color: "#fff",
                }}
              >
                선택한 장소 삭제 ({selectedPlaceIds.length})
              </ActionButton>
            </ButtonGroup>
          )}

          {moveMode && (
            <ActionButton
              onClick={onToggleMoveMode}
              style={{ backgroundColor: "#f57c00", color: "#fff" }}
            >
              옮기기 취소
            </ActionButton>
          )}

          <PlaceList>
            {building.places.map((place) => (
              <PlaceItem
                key={place.placeId}
                onClick={() => !moveMode && onTogglePlaceSelection(place.placeId)}
                style={{ cursor: moveMode ? "default" : "pointer" }}
              >
                <CheckboxContainer onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    type="checkbox"
                    checked={selectedPlaceIds.includes(place.placeId)}
                    onChange={() => onTogglePlaceSelection(place.placeId)}
                    disabled={moveMode}
                  />
                </CheckboxContainer>

                <PlaceInfo>
                  <PlaceName>{place.name}</PlaceName>
                  <PlaceStatus>
                    {place.isConquered && <StatusBadge color="#4caf50">정복됨</StatusBadge>}
                    {place.isClosed && <StatusBadge color="#f57c00">폐업</StatusBadge>}
                    {place.isNotAccessible && (
                      <StatusBadge color="#d32f2f">접근 불가</StatusBadge>
                    )}
                  </PlaceStatus>
                </PlaceInfo>

                {!moveMode && (
                  <DeletePlaceButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeletePlace(place.placeId)
                    }}
                  >
                    삭제
                  </DeletePlaceButton>
                )}
              </PlaceItem>
            ))}
          </PlaceList>
        </Section>
      </Content>
    </Container>
  )
}

const Container = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
})

const Header = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
  },
})

const HeaderContent = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
  },
})

const QuestName = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#666",
    marginBottom: "4px",
  },
})

const Title = styled("h2", {
  base: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#333",
  },
})

const CloseButton = styled("button", {
  base: {
    padding: "4px 8px",
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "#666",
    _hover: {
      color: "#333",
    },
  },
})

const Content = styled("div", {
  base: {
    flex: 1,
    overflow: "auto",
    padding: "16px",
  },
})

const Section = styled("div", {
  base: {
    marginBottom: "24px",
  },
})

const SectionTitle = styled("h3", {
  base: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "12px",
    color: "#333",
  },
})

const ButtonGroup = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
})

const ActionButton = styled("button", {
  base: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s",
    _hover: {
      opacity: 0.9,
    },
    _disabled: {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
})

const PlaceList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },
})

const PlaceItem = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
  },
})

const CheckboxContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
  },
})

const Checkbox = styled("input", {
  base: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    _disabled: {
      cursor: "not-allowed",
    },
  },
})

const PlaceInfo = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
  },
})

const PlaceName = styled("div", {
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

const PlaceStatus = styled("div", {
  base: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
  },
})

const StatusBadge = styled("span", {
  base: {
    fontSize: "11px",
    padding: "2px 6px",
    borderRadius: "3px",
    color: "#fff",
    fontWeight: 500,
  },
})

const DeletePlaceButton = styled("button", {
  base: {
    padding: "6px 12px",
    border: "1px solid #d32f2f",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#d32f2f",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
    _hover: {
      backgroundColor: "#d32f2f",
      color: "#fff",
    },
  },
})
