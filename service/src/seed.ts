/* Generated from given product catalogs */

import type { CatalogProduct, HospitalArticle, SupplierQuestion, Values } from './types.ts'

// Generated from sample-challenge-v01.xlsx
export const HOSPITAL_ARTICLES: HospitalArticle[] = [
  { id: '1', name: 'Nitrilhandschuh Sensicare Ice blau L', category: 'gloves', brand: 'Medline', articleNo: '486803', annualQuantity: 4000, orderUnit: 'Box', unitsPerOrderUnit: 200, baseUnit: 'Stück', gtin: '04046719012345', mdrClass: 'I', targetPrice: 0.019, currency: 'CHF' },
  { id: '2', name: 'Verbandstoff-Wundversorgung-Set steril', category: 'woundCare', brand: 'Hartmann', articleNo: '4754183', annualQuantity: 10000, orderUnit: 'Stk', unitsPerOrderUnit: 1, baseUnit: 'Stück', gtin: '04046719098765', mdrClass: 'IIa', targetPrice: 0.58, currency: 'CHF' },
  { id: '3', name: 'Einmalspritze 10 ml Luer-Lock steril', category: 'syringe', brand: 'B. Braun', articleNo: '9154010', annualQuantity: 15000, orderUnit: 'Pack', unitsPerOrderUnit: 100, baseUnit: 'Stück', gtin: '04040456781234', mdrClass: 'IIa', targetPrice: 0.12, currency: 'CHF' },
  { id: '4', name: 'Infusionsbesteck Intrafix Safe', category: 'infusionSet', brand: 'B. Braun', articleNo: '4169125', annualQuantity: 8500, orderUnit: 'Stk', unitsPerOrderUnit: 1, baseUnit: 'Stück', gtin: '04040456783456', mdrClass: 'IIa', targetPrice: 1.35, currency: 'CHF' },
  { id: '5', name: 'OP-Maske mit Bindebändern', category: 'surgicalMask', brand: 'Hartmann', articleNo: '2912301', annualQuantity: 22000, orderUnit: 'Box', unitsPerOrderUnit: 50, baseUnit: 'Stück', gtin: '04046719111223', mdrClass: 'I', targetPrice: 0.08, currency: 'CHF' },
  { id: '6', name: 'Kanüle Sterican 0,8 × 40 mm', category: 'needle', brand: 'B. Braun', articleNo: '4657689', annualQuantity: 18000, orderUnit: 'Pack', unitsPerOrderUnit: 100, baseUnit: 'Stück', gtin: '04040456999887', mdrClass: 'IIa', targetPrice: 0.06, currency: 'CHF' },
  { id: '7', name: 'Desinfektionstücher Mikrozid AF', category: 'disinfectant', brand: 'Schülke', articleNo: '70003456', annualQuantity: 1200, orderUnit: 'Dose', unitsPerOrderUnit: 100, baseUnit: 'Tuch', gtin: '04012345001234', mdrClass: 'IIa', targetPrice: 3.95, currency: 'CHF' },
  { id: '8', name: 'Einmalhandschuh Latex puderfrei M', category: 'gloves', brand: 'Ansell', articleNo: '9265432', annualQuantity: 9000, orderUnit: 'Box', unitsPerOrderUnit: 100, baseUnit: 'Stück', gtin: '05010023456789', mdrClass: 'I', targetPrice: 0.11, currency: 'CHF' },
  { id: '9', name: 'Urinbecher 100 ml steril', category: 'specimenContainer', brand: 'Sarstedt', articleNo: '751345', annualQuantity: 30000, orderUnit: 'Stk', unitsPerOrderUnit: 1, baseUnit: 'Stück', gtin: '04012345678901', mdrClass: 'I', targetPrice: 0.04, currency: 'CHF' },
  { id: '10', name: 'Wundpflaster elastic 6 cm × 5 m', category: 'plaster', brand: 'Hartmann', articleNo: '9001234', annualQuantity: 2500, orderUnit: 'Rolle', unitsPerOrderUnit: 1, baseUnit: 'Rolle', gtin: '04046719222334', mdrClass: 'I', targetPrice: 1.75, currency: 'CHF' },
]

/** Fixed attribute list per category: what matters for equivalence. Manufacturer is deliberately not part of it. */
/**
 * Coded attributes: answers must be one of these values, and they are compared exactly in code (never by the LLM).
 * To make another attribute structured, add it here.
 */
export const ATTRIBUTE_OPTIONS: Record<string, string[]> = {
  mdrClass: ['I', 'IIa', 'IIb', 'III'],
}

export const CATEGORY_ATTRIBUTES: Record<string, string[]> = {
  syringe: ['volume', 'connector', 'sterile', 'packSize', 'mdrClass'],
  needle: ['size', 'gauge', 'sterile', 'packSize', 'mdrClass'],
}

/** Attribute values the LLM would extract from the hospital record (name + master data). */
export const REQUIREMENTS: Record<string, Values> = {
  '3': { volume: '10 ml', connector: 'Luer-Lock', sterile: 'Yes', packSize: '100', mdrClass: 'IIa' },
  '6': { size: '0,8 × 40 mm', gauge: '21 G', sterile: 'Yes', packSize: '100', mdrClass: 'IIa' },
}

// Attribute values are quoted as written in the catalogs (the LLM judges them against the requirements).
// From client/public/product_catalog_01.pdf (B. Braun) and product_catalog_02.pdf (BD)
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'bb-4617100V', category: 'syringe', supplier: 'B. Braun', name: 'Omnifix® Luer Lock Solo 10 ml', articleNo: '4617100V',
    source: 'product_catalog_01.pdf, p. 16',
    attributes: { volume: '10 ml, nutzbar bis 12 ml', connector: 'Luer-Lock-Ansatz', sterile: 'Einzeln steril verpackt', packSize: 'Packung zu 100 Stück', mdrClass: null },
  },
  {
    id: 'bd-300912', category: 'syringe', supplier: 'BD', name: 'BD Plastipak™ Luer-Lok™ 10 ml', articleNo: '300912',
    source: 'product_catalog_02.pdf, p. 13',
    attributes: { volume: '10 ml', connector: 'BD Luer-Lok™-Ansatz', sterile: 'Sterile Einzelverpackung', packSize: 'VE 100 / UK 400', mdrClass: null },
  },
  {
    id: 'bb-4657527B', category: 'needle', supplier: 'B. Braun', name: 'Sterican® 21 G × 1½"', articleNo: '4657527B',
    source: 'product_catalog_01.pdf, p. 49',
    attributes: { size: '0,80 mm x 40 mm', gauge: '21 G x 1 ½"', sterile: 'Einzeln steril verpackt', packSize: 'Packung zu 100 Stück', mdrClass: 'IIa' },
  },
  {
    id: 'bd-304432', category: 'needle', supplier: 'BD', name: 'BD Microlance™ 21 G 1½" Nr. 2', articleNo: '304432',
    source: 'product_catalog_02.pdf, p. 6',
    attributes: { size: '0,8 x 40 mm', gauge: '21 G 1 1/2" – Nr. 2', sterile: 'Sterile Einzelverpackung, Einmalgebrauch', packSize: 'VE 100 / UK 5.000', mdrClass: null },
  },
]

/**
 * An earlier round of the loop: B. Braun already answered the MDR class of Sterican (the PDFs state no MDR class).
 * Its value is written into the product above, exactly as answering a question does at runtime.
 */
export const SEED_QUESTIONS: SupplierQuestion[] = [{ id: 'bb-4657527B:mdrClass', productId: 'bb-4657527B', attribute: 'mdrClass', answer: 'IIa' }]
