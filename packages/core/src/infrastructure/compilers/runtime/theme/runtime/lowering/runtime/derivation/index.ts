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
import { cardChromeDeriver } from "./chrome/card";
import { tableChromeDeriver } from "./chrome/table";
import { avatarChromeDeriver } from "./chrome/avatar";
import { tagChromeDeriver } from "./chrome/tag";
import { badgeChromeDeriver } from "./chrome/badge";
import { treeChromeDeriver } from "./chrome/tree";
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
  cardChromeDeriver,
  tableChromeDeriver,
  avatarChromeDeriver,
  tagChromeDeriver,
  badgeChromeDeriver,
  treeChromeDeriver,
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
  splitterChromeDeriver,
  seedsDeriver,
]);
