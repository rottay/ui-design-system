/**
 * Rottay recipe contracts (DS-S001).
 *
 * A recipe is the typed, bounded resolution from semantic axis selections to
 * the stable slot class strings a skin selects on. Recipes emit ONLY semantic
 * `rottay-*` / `ds-*` classes; raw palette/radius/shadow utility literals are
 * not recipe material. The supplier that resolves a recipe is an
 * implementation detail of the engine owner — no supplier type appears in
 * these declarations and applications never import the supplier directly.
 */

/** One or many semantic class names attached to a slot. */
export type RecipeClassValue = string | readonly string[];

/**
 * Axis matrix: axis name -> allowed value -> per-slot classes. Boolean axes
 * declare `true`/`false` value keys and are selected with booleans.
 */
export type RecipeAxisMatrix<Slot extends string> = Readonly<
  Record<
    string,
    Readonly<Record<string, Partial<Readonly<Record<Slot, RecipeClassValue>>>>>
  >
>;

type RecipeAxisKey<Axis> = keyof Axis & string;

/**
 * Boolean recipe axes are authored with `true` / `false` keys but consumed as
 * booleans. Every other axis is consumed strictly through its authored keys.
 */
export type RecipeAxisSelectionValue<Axis> =
  Extract<RecipeAxisKey<Axis>, 'true' | 'false'> extends never
    ? RecipeAxisKey<Axis>
    : Exclude<RecipeAxisKey<Axis>, 'true' | 'false'> | boolean;

/** One bounded condition over the axes actually declared by a recipe. */
export type RecipeCondition<Axes> = {
  readonly [Axis in keyof Axes & string]?: RecipeAxisSelectionValue<Axes[Axis]>;
};

/** Compound rule: applies extra slot classes when every named axis matches. */
export interface RecipeCompoundRule<Slot extends string, Axes> {
  readonly when: RecipeCondition<Axes>;
  readonly apply: Partial<Readonly<Record<Slot, RecipeClassValue>>>;
}

/** Full authored recipe. `slots` carries the always-present base classes. */
export interface RecipeDefinition<
  Slot extends string,
  Axes extends RecipeAxisMatrix<Slot>,
> {
  /** Stable recipe identifier, e.g. `button`, `card`, `tabs`. */
  readonly name: string;
  readonly slots: Readonly<Record<Slot, RecipeClassValue>>;
  readonly axes: Axes;
  readonly defaults: {
    readonly [Axis in keyof Axes & string]?: RecipeAxisSelectionValue<Axes[Axis]>;
  };
  readonly compound?: readonly RecipeCompoundRule<Slot, Axes>[];
}

/** Selection: one value per axis; boolean axes accept booleans. */
export type RecipeSelection<
  Slot extends string,
  Axes extends RecipeAxisMatrix<Slot>,
> = {
  readonly [Axis in keyof Axes & string]?:
    | RecipeAxisSelectionValue<Axes[Axis]>
    | undefined;
};

/** Reject extra axes even for a static recipe whose authored axis map is `{}`. */
export type ExactRecipeSelection<Axes, Selection> = Selection &
  Readonly<Record<Exclude<keyof Selection, keyof Axes>, never>>;

/** Caller-supplied extra classes appended per slot (the `className` seam). */
export type RecipeSlotExtras<Slot extends string> = Partial<
  Readonly<Record<Slot, string | undefined>>
>;

/** Resolved output: one final class string per declared slot. */
export type ResolvedRecipeSlots<Slot extends string> = Readonly<
  Record<Slot, string>
>;

/**
 * What a recipe states about itself: its identity, its slots and the authored
 * value domain of every axis. This is the whole of what the public manifest
 * publishes, and it is derivable from the definition alone — no resolver, no
 * supplier and no component involved.
 */
export interface RecipeShape<Slot extends string, Axes> {
  readonly name: string;
  readonly slotNames: readonly Slot[];
  readonly axisNames: ReadonlyArray<keyof Axes & string>;
  /** Authored value domain per axis, for the public manifest. */
  readonly axisValues: Readonly<Record<keyof Axes & string, readonly string[]>>;
}

/**
 * Derive a definition's public shape. The single derivation in the package:
 * the engine builds its resolver on top of it and the manifest publishes it,
 * so the two can never disagree about what a family exposes.
 */
export function describeRecipeDefinition<
  Slot extends string,
  Axes extends RecipeAxisMatrix<Slot>,
>(definition: RecipeDefinition<Slot, Axes>): RecipeShape<Slot, Axes> {
  const slotNames = Object.keys(definition.slots) as Slot[];
  const axisNames = Object.keys(definition.axes) as Array<keyof Axes & string>;
  const axisValues = Object.fromEntries(
    axisNames.map((axis) => [axis, Object.keys(definition.axes[axis])])
  ) as unknown as Record<keyof Axes & string, readonly string[]>;
  return { name: definition.name, slotNames, axisNames, axisValues };
}

/** The resolver a component engine consumes. */
export interface RecipeResolver<
  Slot extends string,
  Axes extends RecipeAxisMatrix<Slot>,
> extends RecipeShape<Slot, Axes> {
  resolve<Selection extends RecipeSelection<Slot, Axes> = RecipeSelection<Slot, Axes>>(
    selection?: ExactRecipeSelection<Axes, Selection>,
    extras?: RecipeSlotExtras<Slot>
  ): ResolvedRecipeSlots<Slot>;
}
