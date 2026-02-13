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
  QuestCompletion: () => import("./QuestCompletion"),
  ReinspectionDialog: () => import("./ReinspectionDialog"),
  CheckInConfirm: () => import("./CheckInConfirm"),
  AccessibilityReportDetail: () => import("./AccessibilityReportDetail"),
}

export default register
