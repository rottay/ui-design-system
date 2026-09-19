/**
 * @fileoverview The family registry: every deriver the one pipeline runs.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../foundation/contract";
import { axesDeriver } from "./axes";
import { chartsDeriver } from "./charts";
import { chromeDeriver } from "./chrome";
import { buttonChromeDeriver } from "./chrome/button";
import { checkboxChromeDeriver } from "./chrome/checkbox";
import { inputChromeDeriver } from "./chrome/input";
import { textareaChromeDeriver } from "./chrome/textarea";
import { passwordInputChromeDeriver } from "./chrome/password-input";
import { otpInputChromeDeriver } from "./chrome/otp-input";
import { tagInputChromeDeriver } from "./chrome/tag-input";
import { inputNumberChromeDeriver } from "./chrome/input-number";
import { formFieldChromeDeriver } from "./chrome/form-field";
import { formChromeDeriver } from "./chrome/form";
import { selectChromeDeriver } from "./chrome/select";
import { autoCompleteChromeDeriver } from "./chrome/auto-complete";
import { mentionsChromeDeriver } from "./chrome/mentions";
import { cascaderChromeDeriver } from "./chrome/cascader";
import { treeSelectChromeDeriver } from "./chrome/tree-select";
import { transferChromeDeriver } from "./chrome/transfer";
import { timePickerChromeDeriver } from "./chrome/time-picker";
import { datePickerChromeDeriver } from "./chrome/date-picker";
import { colorPickerChromeDeriver } from "./chrome/color-picker";
import { modalChromeDeriver } from "./chrome/modal";
import { drawerChromeDeriver } from "./chrome/drawer";
import { sheetChromeDeriver } from "./chrome/sheet";
import { alertDialogChromeDeriver } from "./chrome/alert-dialog";
import { confirmDialogChromeDeriver } from "./chrome/confirm-dialog";
import { popoverChromeDeriver } from "./chrome/popover";
import { hoverCardChromeDeriver } from "./chrome/hover-card";
import { dropdownChromeDeriver } from "./chrome/dropdown";
import { menuChromeDeriver } from "./chrome/menu";
import { tabsChromeDeriver } from "./chrome/tabs";
import { breadcrumbChromeDeriver } from "./chrome/breadcrumb";
import { paginationChromeDeriver } from "./chrome/pagination";
import { stepperChromeDeriver } from "./chrome/stepper";
import { sidebarSurfaceChromeDeriver } from "./chrome/sidebar-surface";
import { headerChromeDeriver } from "./chrome/header";
import { formHeaderChromeDeriver } from "./chrome/form-header";
import { editHeaderChromeDeriver } from "./chrome/edit-header";
import { cockpitHeaderChromeDeriver } from "./chrome/cockpit-header";
import { workbenchHeaderChromeDeriver } from "./chrome/workbench-header";
import { sectionFrameChromeDeriver } from "./chrome/section-frame";
import { mobileHeaderChromeDeriver } from "./chrome/mobile-header";
import { statsHeaderChromeDeriver } from "./chrome/stats-header";
import { surfaceLifecycleChromeDeriver } from "./chrome/surface-lifecycle";
import { appShellChromeDeriver } from "./chrome/app-shell";
import { actionDockChromeDeriver } from "./chrome/action-dock";
import { scopeSwitcherChromeDeriver } from "./chrome/scope-switcher";
import { viewModeSwitcherChromeDeriver } from "./chrome/view-mode-switcher";
import { collectionHeaderChromeDeriver } from "./chrome/collection-header";
import { dashboardHeaderChromeDeriver } from "./chrome/dashboard-header";
import { detailHeaderChromeDeriver } from "./chrome/detail-header";
import { headerSurfaceChromeDeriver } from "./chrome/header-surface";
import { recordChromeDeriver } from "./chrome/record";
import { formSectionsChromeDeriver } from "./chrome/form-sections";
import { formSurfaceChromeDeriver } from "./chrome/form-surface";
import { wizardSurfaceChromeDeriver } from "./chrome/wizard-surface";
import { detailFormSurfaceChromeDeriver } from "./chrome/detail-form-surface";
import { guidedDraftFormChromeDeriver } from "./chrome/guided-draft-form";
import { cardChromeDeriver } from "./chrome/card";
import { tableChromeDeriver } from "./chrome/table";
import { dataTableChromeDeriver } from "./chrome/data-table";
import { avatarChromeDeriver } from "./chrome/avatar";
import { tagChromeDeriver } from "./chrome/tag";
import { badgeChromeDeriver } from "./chrome/badge";
import { treeChromeDeriver } from "./chrome/tree";
import { kanbanBoardChromeDeriver } from "./chrome/kanban-board";
import { calendarViewChromeDeriver } from "./chrome/calendar-view";
import { fileManagerChromeDeriver } from "./chrome/file-manager";
import { activeFiltersBarChromeDeriver } from "./chrome/active-filters-bar";
import { widgetBoardChromeDeriver } from "./chrome/widget-board";
import { columnMenuChromeDeriver } from "./chrome/column-menu";
import { savedViewsChromeDeriver } from "./chrome/saved-views";
import { columnSettingsChromeDeriver } from "./chrome/column-settings";
import { filterPanelChromeDeriver } from "./chrome/filter-panel";
import { filterChipChromeDeriver } from "./chrome/filter-chip";
import { toolbarChromeDeriver } from "./chrome/toolbar";
import { descriptionsChromeDeriver } from "./chrome/descriptions";
import { listChromeDeriver } from "./chrome/list";
import { tooltipChromeDeriver } from "./chrome/tooltip";
import { tourChromeDeriver } from "./chrome/tour";
import { notifierChromeDeriver } from "./chrome/notifier";
import { alertChromeDeriver } from "./chrome/alert";
import { containerChromeDeriver } from "./chrome/container";
import { aspectRatioChromeDeriver } from "./chrome/aspect-ratio";
import { spaceChromeDeriver } from "./chrome/space";
import { dividerChromeDeriver } from "./chrome/divider";
import { flexChromeDeriver } from "./chrome/flex";
import { stackChromeDeriver } from "./chrome/stack";
import { boxChromeDeriver } from "./chrome/box";
import { gridChromeDeriver } from "./chrome/grid";
import { collapseChromeDeriver } from "./chrome/collapse";
import { splitterChromeDeriver } from "./chrome/splitter";
import { radioChromeDeriver } from "./chrome/radio";
import { segmentedChromeDeriver } from "./chrome/segmented";
import { toggleChromeDeriver } from "./chrome/toggle";
import { densityDeriver } from "./density";
import { elevationDeriver } from "./elevation";
import { expressiveDeriver } from "./expressive";
import { materialsDeriver } from "./materials";
import { motionDeriver } from "./motion";
import { paletteDeriver } from "./palette";
import { responsiveDeriver } from "./responsive";
import { rhythmDeriver } from "./rhythm";
import { rampsDeriver } from "./ramps";
import { seedsDeriver } from "./seeds";
import { shapeDeriver } from "./shape";
import { statesDeriver } from "./states";
import { surfacesDeriver } from "./surfaces";
import { tenantDeriver } from "./tenant";
import { tintDeriver } from "./tint";
import { typographyDeriver } from "./typography";

/**
 * The registry, in EMISSION order.
 *
 * Emission order decides where a channel's declaration lands in the compiled
 * block; it never decides which value wins -- that is the rank on each
 * deriver, resolved by the pipeline per channel. The two are deliberately
 * independent: a family can be moved in this list without changing a single
 * value, and a rank can be changed without moving a single declaration.
 */
export const FAMILY_DERIVERS: readonly FamilyDeriver[] = Object.freeze([
  expressiveDeriver,
  axesDeriver,
  typographyDeriver,
  paletteDeriver,
  shapeDeriver,
  statesDeriver,
  surfacesDeriver,
  elevationDeriver,
  materialsDeriver,
  rampsDeriver,
  chartsDeriver,
  tintDeriver,
  densityDeriver,
  rhythmDeriver,
  responsiveDeriver,
  motionDeriver,
  tenantDeriver,
  chromeDeriver,
  buttonChromeDeriver,
  checkboxChromeDeriver,
  radioChromeDeriver,
  segmentedChromeDeriver,
  toggleChromeDeriver,
  inputChromeDeriver,
  textareaChromeDeriver,
  passwordInputChromeDeriver,
  otpInputChromeDeriver,
  tagInputChromeDeriver,
  inputNumberChromeDeriver,
  formFieldChromeDeriver,
  formChromeDeriver,
  selectChromeDeriver,
  autoCompleteChromeDeriver,
  mentionsChromeDeriver,
  cascaderChromeDeriver,
  treeSelectChromeDeriver,
  transferChromeDeriver,
  timePickerChromeDeriver,
  datePickerChromeDeriver,
  colorPickerChromeDeriver,
  modalChromeDeriver,
  drawerChromeDeriver,
  sheetChromeDeriver,
  alertDialogChromeDeriver,
  confirmDialogChromeDeriver,
  popoverChromeDeriver,
  hoverCardChromeDeriver,
  dropdownChromeDeriver,
  menuChromeDeriver,
  tabsChromeDeriver,
  breadcrumbChromeDeriver,
  paginationChromeDeriver,
  stepperChromeDeriver,
  sidebarSurfaceChromeDeriver,
  headerChromeDeriver,
  formHeaderChromeDeriver,
  editHeaderChromeDeriver,
  cockpitHeaderChromeDeriver,
  workbenchHeaderChromeDeriver,
  sectionFrameChromeDeriver,
  mobileHeaderChromeDeriver,
  statsHeaderChromeDeriver,
  surfaceLifecycleChromeDeriver,
  appShellChromeDeriver,
  actionDockChromeDeriver,
  scopeSwitcherChromeDeriver,
  viewModeSwitcherChromeDeriver,
  collectionHeaderChromeDeriver,
  dashboardHeaderChromeDeriver,
  detailHeaderChromeDeriver,
  headerSurfaceChromeDeriver,
  recordChromeDeriver,
  formSectionsChromeDeriver,
  formSurfaceChromeDeriver,
  wizardSurfaceChromeDeriver,
  detailFormSurfaceChromeDeriver,
  guidedDraftFormChromeDeriver,
  cardChromeDeriver,
  tableChromeDeriver,
  dataTableChromeDeriver,
  avatarChromeDeriver,
  tagChromeDeriver,
  badgeChromeDeriver,
  treeChromeDeriver,
  kanbanBoardChromeDeriver,
  calendarViewChromeDeriver,
  fileManagerChromeDeriver,
  activeFiltersBarChromeDeriver,
  widgetBoardChromeDeriver,
  columnMenuChromeDeriver,
  savedViewsChromeDeriver,
  columnSettingsChromeDeriver,
  filterPanelChromeDeriver,
  filterChipChromeDeriver,
  toolbarChromeDeriver,
  descriptionsChromeDeriver,
  listChromeDeriver,
  tooltipChromeDeriver,
  tourChromeDeriver,
  notifierChromeDeriver,
  alertChromeDeriver,
  containerChromeDeriver,
  aspectRatioChromeDeriver,
  spaceChromeDeriver,
  dividerChromeDeriver,
  flexChromeDeriver,
  stackChromeDeriver,
  boxChromeDeriver,
  gridChromeDeriver,
  collapseChromeDeriver,
  splitterChromeDeriver,
  seedsDeriver,
]);
