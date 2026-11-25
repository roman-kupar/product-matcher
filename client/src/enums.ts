/**
 * Domain enums as `as const` objects (TS `enum` is disabled by `erasableSyntaxOnly`).
 * Each has a matching type of the same name, so both `Verdict.Equivalent` and `: Verdict` work.
 * Values double as translation-key suffixes (e.g. `verdict.EQUIVALENT`, `attr.volume`).
 */

export const View = {
  Hospital: 'hospital',
  Supplier: 'supplier',
} as const
export type View = (typeof View)[keyof typeof View]

export const Verdict = {
  Equivalent: 'EQUIVALENT',
  NeedsInfo: 'NEEDS_INFO',
  NotEquivalent: 'NOT_EQUIVALENT',
} as const
export type Verdict = (typeof Verdict)[keyof typeof Verdict]

export const AttributeStatus = {
  Match: 'MATCH',
  Mismatch: 'MISMATCH',
  Missing: 'MISSING',
} as const
export type AttributeStatus = (typeof AttributeStatus)[keyof typeof AttributeStatus]

/** Product attributes compared for equivalence. To add one: add it here and `attr.<value>` to every language file. */
export const AttributeKey = {
  Volume: 'volume',
  Connector: 'connector',
  Sterile: 'sterile',
  PackSize: 'packSize',
  MdrClass: 'mdrClass',
  Size: 'size',
  Gauge: 'gauge',
} as const
export type AttributeKey = (typeof AttributeKey)[keyof typeof AttributeKey]

/** Product category. Candidates are matched by category; each category defines its own attribute list. */
export const Category = {
  Gloves: 'gloves',
  WoundCare: 'woundCare',
  Syringe: 'syringe',
  InfusionSet: 'infusionSet',
  SurgicalMask: 'surgicalMask',
  Needle: 'needle',
  Disinfectant: 'disinfectant',
  SpecimenContainer: 'specimenContainer',
  Plaster: 'plaster',
} as const
export type Category = (typeof Category)[keyof typeof Category]

/** Overall result for a hospital article, derived from its candidates' verdicts (never stored). */
export const ArticleStatus = {
  EquivalentAvailable: 'EQUIVALENT_AVAILABLE',
  NeedsInfo: 'NEEDS_INFO',
  NoEquivalent: 'NO_EQUIVALENT',
  NoCandidates: 'NO_CANDIDATES',
} as const
export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus]
