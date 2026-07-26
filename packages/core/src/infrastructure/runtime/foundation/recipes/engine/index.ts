/**
 * Rottay recipe engine (DS-S001) — the ONLY module allowed to import the
 * recipe supplier. Everything it returns is typed by the Rottay contracts in
 * `../contracts`; supplier types never reach a public declaration and
 * applications never import the supplier to restyle a component.
 *
 * Supplier: `tailwind-variants@3.2.2` through its `/lite` entry (no
 * tailwind-merge). Merge resolution is unnecessary because recipes emit
 * disjoint semantic classes, never conflicting utility literals.
 */
import { tv } from "tailwind-variants/lite";

import { describeRecipeDefinition } from "../contracts";
import type {
  RecipeAxisMatrix,
  RecipeClassValue,
  RecipeDefinition,
  ExactRecipeSelection,
  RecipeResolver,
  RecipeSelection,
  RecipeSlotExtras,
  ResolvedRecipeSlots,
} from "../contracts";

const toClassList = (value: RecipeClassValue | undefined): string[] => {
  if (value === undefined) return [];
  return Array.isArray(value) ? [...value] : [value as string];
};

/**
 * Build a resolver from an authored definition. Output class order is stable:
 * slot base classes, then axis classes in declaration order, then compound
 * classes, then the caller extra — so migrated components keep their exact
 * historical class strings.
 */
export function defineRecipe<
  Slot extends string,
  Axes extends RecipeAxisMatrix<Slot>,
>(definition: RecipeDefinition<Slot, Axes>): RecipeResolver<Slot, Axes> {
  const shape = describeRecipeDefinition(definition);
  const { axisNames, slotNames } = shape;

  const variants: Record<string, Record<string, Record<string, string>>> = {};
  for (const axis of axisNames) {
    const matrix = definition.axes[axis];
    variants[axis] = {};
    for (const value of Object.keys(matrix)) {
      const slotClasses: Record<string, string> = {};
      for (const slot of slotNames) {
        const classes = toClassList(matrix[value]?.[slot]);
        if (classes.length > 0) slotClasses[slot] = classes.join(" ");
      }
      variants[axis][value] = slotClasses;
    }
  }

  const compoundVariants = (definition.compound ?? []).map((rule) => {
    const slotClasses: Record<string, string> = {};
    for (const slot of slotNames) {
      const classes = toClassList(rule.apply[slot]);
      if (classes.length > 0) slotClasses[slot] = classes.join(" ");
    }
    return { ...rule.when, class: slotClasses };
  });

  const slots: Record<string, string> = {};
  for (const slot of slotNames) {
    slots[slot] = toClassList(definition.slots[slot]).join(" ");
  }

  // Boundary cast: the supplier's generics do not model per-slot compound
  // `class` objects or boolean defaults, both of which its runtime supports
  // and the engine drill proves. The cast is internal to this owner; every
  // exported signature is typed by the Rottay contracts only.
  const supplierConfig: unknown = {
    slots,
    variants,
    compoundVariants,
    defaultVariants: definition.defaults,
  };
  const supplierResolver = tv(
    supplierConfig as Parameters<typeof tv>[0]
  ) as unknown as (
    selection?: Record<string, unknown>
  ) => Record<Slot, (slotOptions?: Record<string, unknown>) => string>;

  const resolve = <
    Selection extends RecipeSelection<Slot, Axes> = RecipeSelection<Slot, Axes>,
  >(
    selection?: ExactRecipeSelection<Axes, Selection>,
    extras?: RecipeSlotExtras<Slot>
  ): ResolvedRecipeSlots<Slot> => {
    const slotResolvers = supplierResolver({ ...selection });
    const resolved = {} as Record<Slot, string>;
    for (const slot of slotNames) {
      const extra = extras?.[slot];
      resolved[slot] = slotResolvers[slot](
        extra ? { class: extra } : undefined
      ).trim();
    }
    return resolved;
  };

  return { ...shape, resolve };
}
