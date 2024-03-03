const register = {
  BuildingDetailSheetMobile: () => import("./BuildingDetailSheet/BuildingDetailSheet.mobile"),
  BuildingDetailSheetDesktop: () => import("./BuildingDetailSheet/BuildingDetailSheet.desktop"),
  RegionList: () => import("./RegionList"),
  QuestGuide: () => import("./QuestGuide"),
  QuestSummarySheet: () => import("./QuestSummarySheet"),
}

export default register
