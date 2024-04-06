const register = {
  AccessibilityImage: () => import("./AccessibilityImage/AccessibilityImage"),
  BuildingDetailSheetMobile: () => import("./BuildingDetailSheet/BuildingDetailSheet.mobile"),
  BuildingDetailSheetDesktop: () => import("./BuildingDetailSheet/BuildingDetailSheet.desktop"),
  RegionCreate: () => import("./RegionCreate"),
  RegionDraw: () => import("./RegionDraw"),
  RegionList: () => import("./RegionList"),
  RegionSelector: () => import("./RegionSelector"),
  QuestGuide: () => import("./QuestGuide"),
  QuestSummarySheet: () => import("./QuestSummarySheet"),
}

export default register
