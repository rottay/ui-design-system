import { groundFor } from "@/components/probe-ground";
import { FleetStage, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  RecipeProfileSpecimen,
  type SpecimenState,
  type SpecimenStress,
} from "@/components/recipe-profile-specimen";
import {
  specimenGroundRequest,
  type SpecimenLocale,
  type SpecimenSource,
} from "@/components/recipe-profile-specimen/source";

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

export default async function RecipeProfileSpecimenPage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const cell = {
    source: sanitizeSource(probeParam(params, "source")),
    locale: sanitizeLocale(probeParam(params, "locale")),
    state: sanitizeState(probeParam(params, "state")),
    stress: sanitizeStress(probeParam(params, "stress")),
  };
  const ground = await groundFor(specimenGroundRequest(cell.source, cell.locale));
  return (
    <FleetStage ground={ground}>
      <RecipeProfileSpecimen {...cell} />
    </FleetStage>
  );
}
