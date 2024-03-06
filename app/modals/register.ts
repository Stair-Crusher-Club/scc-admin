const register = {
  BuildingDetailSheetMobile: () => import("./BuildingDetailSheet/BuildingDetailSheet.mobile"),
  BuildingDetailSheetDesktop: () => import("./BuildingDetailSheet/BuildingDetailSheet.desktop"),
  RegionCreate: () => import("./RegionCreate"),
  RegionList: () => import("./RegionList"),
  QuestGuide: () => import("./QuestGuide"),
  QuestSummarySheet: () => import("./QuestSummarySheet"),
}

export default register
