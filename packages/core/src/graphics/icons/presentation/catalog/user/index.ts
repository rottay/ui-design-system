"use client";

/**
 * @fileoverview User and identity icons - people, auth, security
 */

import { UserIcon as User } from "@phosphor-icons/react/dist/ssr/User";
import { UsersIcon as Users } from "@phosphor-icons/react/dist/ssr/Users";
import { UserCheckIcon as UserCheck } from "@phosphor-icons/react/dist/ssr/UserCheck";
import { UserPlusIcon as UserPlus } from "@phosphor-icons/react/dist/ssr/UserPlus";
import { UserMinusIcon as UserMinus } from "@phosphor-icons/react/dist/ssr/UserMinus";
import { ShieldIcon as Shield } from "@phosphor-icons/react/dist/ssr/Shield";
import { ShieldCheckIcon as ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { LockIcon as Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { KeyIcon as Key } from "@phosphor-icons/react/dist/ssr/Key";
import { FingerprintIcon as Fingerprint } from "@phosphor-icons/react/dist/ssr/Fingerprint";
import { UserGearIcon as UserCog } from "@phosphor-icons/react/dist/ssr/UserGear";
import { UserCircleIcon as UserRound } from "@phosphor-icons/react/dist/ssr/UserCircle";
import { UserCircleCheckIcon as UserRoundCheck } from "@phosphor-icons/react/dist/ssr/UserCircleCheck";
import { UserMinusIcon as UserX } from "@phosphor-icons/react/dist/ssr/UserMinus";
import { GearIcon as Settings } from "@phosphor-icons/react/dist/ssr/Gear";
import { GearSixIcon as Settings2 } from "@phosphor-icons/react/dist/ssr/GearSix";
import { LockOpenIcon as Unlock } from "@phosphor-icons/react/dist/ssr/LockOpen";
import { KeyIcon as KeyRound } from "@phosphor-icons/react/dist/ssr/Key";
import { SignOutIcon as LogOut } from "@phosphor-icons/react/dist/ssr/SignOut";
import { createPhosphorCompatibilityIcon } from "../../../runtime/factory/phosphor-compat";

export const UserIcon = createPhosphorCompatibilityIcon(User, "UserIcon");
export const UsersIcon = createPhosphorCompatibilityIcon(Users, "UsersIcon");
export const UserCheckIcon = createPhosphorCompatibilityIcon(
  UserCheck,
  "UserCheckIcon"
);
export const UserXIcon = createPhosphorCompatibilityIcon(UserX, "UserXIcon");
export const UserMinusIcon = createPhosphorCompatibilityIcon(
  UserMinus,
  "UserMinusIcon"
);
export const SettingsIcon = createPhosphorCompatibilityIcon(
  Settings,
  "SettingsIcon"
);
export const Settings2Icon = createPhosphorCompatibilityIcon(
  Settings2,
  "Settings2Icon"
);
export const ShieldIcon = createPhosphorCompatibilityIcon(Shield, "ShieldIcon");
export const ShieldCheckIcon = createPhosphorCompatibilityIcon(
  ShieldCheck,
  "ShieldCheckIcon"
);
export const LockIcon = createPhosphorCompatibilityIcon(Lock, "LockIcon");
export const KeyIcon = createPhosphorCompatibilityIcon(Key, "KeyIcon");
export const KeyRoundIcon = createPhosphorCompatibilityIcon(
  KeyRound,
  "KeyRoundIcon"
);
export const FingerprintIcon = createPhosphorCompatibilityIcon(
  Fingerprint,
  "FingerprintIcon"
);
export const LogOutIcon = createPhosphorCompatibilityIcon(LogOut, "LogOutIcon");
export const UserCogIcon = createPhosphorCompatibilityIcon(
  UserCog,
  "UserCogIcon"
);
export const UserPlusIcon = createPhosphorCompatibilityIcon(
  UserPlus,
  "UserPlusIcon"
);
export const UserRoundIcon = createPhosphorCompatibilityIcon(
  UserRound,
  "UserRoundIcon"
);
export const UserRoundCheckIcon = createPhosphorCompatibilityIcon(
  UserRoundCheck,
  "UserRoundCheckIcon"
);
export const UnlockIcon = createPhosphorCompatibilityIcon(Unlock, "UnlockIcon");
