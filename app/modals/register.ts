const register = {
  BuildingDetailSheetMobile: () => import("./BuildingDetailSheet/BuildingDetailSheet.mobile"),
  BuildingDetailSheetDesktop: () => import("./BuildingDetailSheet/BuildingDetailSheet.desktop"),
  QuestSummarySheet: () => import("./QuestSummarySheet"),
}

export default register
