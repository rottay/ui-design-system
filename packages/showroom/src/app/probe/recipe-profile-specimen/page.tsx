"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  RecipeProfileSpecimen,
  type SpecimenLocale,
  type SpecimenSource,
  type SpecimenState,
  type SpecimenStress,
} from "@/components/recipe-profile-specimen";

function sanitizeSource(value: string | null): SpecimenSource {
  return value === "editorial-db" ? value : "technical-static";
}

function sanitizeLocale(value: string | null): SpecimenLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeState(value: string | null): SpecimenState {
  return value === "focus" ||
    value === "disabled" ||
    value === "loading" ||
    value === "selected"
    ? value
    : "rest";
}

function sanitizeStress(value: string | null): SpecimenStress {
  return value === "long" || value === "dense" || value === "empty"
    ? value
    : "default";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      locale: sanitizeLocale(searchParams.get("locale")),
      state: sanitizeState(searchParams.get("state")),
      stress: sanitizeStress(searchParams.get("stress")),
    }),
    [searchParams]
  );

  return <RecipeProfileSpecimen {...cell} />;
}

export default function RecipeProfileSpecimenPage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
