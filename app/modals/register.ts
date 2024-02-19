const register = {
  BuildingDetailSheetMobile: () => import("./BuildingDetailSheet/BuildingDetailSheet.mobile"),
  BuildingDetailSheetDesktop: () => import("./BuildingDetailSheet/BuildingDetailSheet.desktop"),
  QuestGuide: () => import("./QuestGuide"),
  QuestSummarySheet: () => import("./QuestSummarySheet"),
}

export default register
