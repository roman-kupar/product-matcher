import type { Attributes, CatalogProduct, HospitalArticle } from './types'

// From client/public/sample-challenge-v01.xlsx
export const HOSPITAL_ARTICLES: HospitalArticle[] = [
  { id: '1', name: 'Nitrilhandschuh Sensicare Ice blau L', brand: 'Medline', articleNo: '486803', annualQuantity: 4000, orderUnit: 'Box', unitsPerOrderUnit: 200, baseUnit: 'Stück', gtin: '04046719012345', mdrClass: 'I', targetPrice: 0.019, currency: 'CHF' },
  { id: '2', name: 'Verbandstoff-Wundversorgung-Set steril', brand: 'Hartmann', articleNo: '4754183', annualQuantity: 10000, orderUnit: 'Stk', unitsPerOrderUnit: 1, baseUnit: 'Stück', gtin: '04046719098765', mdrClass: 'IIa', targetPrice: 0.58, currency: 'CHF' },
  { id: '3', name: 'Einmalspritze 10 ml Luer-Lock steril', brand: 'B. Braun', articleNo: '9154010', annualQuantity: 15000, orderUnit: 'Pack', unitsPerOrderUnit: 100, baseUnit: 'Stück', gtin: '04040456781234', mdrClass: 'IIa', targetPrice: 0.12, currency: 'CHF' },
  { id: '4', name: 'Infusionsbesteck Intrafix Safe', brand: 'B. Braun', articleNo: '4169125', annualQuantity: 8500, orderUnit: 'Stk', unitsPerOrderUnit: 1, baseUnit: 'Stück', gtin: '04040456783456', mdrClass: 'IIa', targetPrice: 1.35, currency: 'CHF' },
  { id: '5', name: 'OP-Maske mit Bindebändern', brand: 'Hartmann', articleNo: '2912301', annualQuantity: 22000, orderUnit: 'Box', unitsPerOrderUnit: 50, baseUnit: 'Stück', gtin: '04046719111223', mdrClass: 'I', targetPrice: 0.08, currency: 'CHF' },
  { id: '6', name: 'Kanüle Sterican 0,8 × 40 mm', brand: 'B. Braun', articleNo: '4657689', annualQuantity: 18000, orderUnit: 'Pack', unitsPerOrderUnit: 100, baseUnit: 'Stück', gtin: '04040456999887', mdrClass: 'IIa', targetPrice: 0.06, currency: 'CHF' },
  { id: '7', name: 'Desinfektionstücher Mikrozid AF', brand: 'Schülke', articleNo: '70003456', annualQuantity: 1200, orderUnit: 'Dose', unitsPerOrderUnit: 100, baseUnit: 'Tuch', gtin: '04012345001234', mdrClass: 'IIa', targetPrice: 3.95, currency: 'CHF' },
  { id: '8', name: 'Einmalhandschuh Latex puderfrei M', brand: 'Ansell', articleNo: '9265432', annualQuantity: 9000, orderUnit: 'Box', unitsPerOrderUnit: 100, baseUnit: 'Stück', gtin: '05010023456789', mdrClass: 'I', targetPrice: 0.11, currency: 'CHF' },
  { id: '9', name: 'Urinbecher 100 ml steril', brand: 'Sarstedt', articleNo: '751345', annualQuantity: 30000, orderUnit: 'Stk', unitsPerOrderUnit: 1, baseUnit: 'Stück', gtin: '04012345678901', mdrClass: 'I', targetPrice: 0.04, currency: 'CHF' },
  { id: '10', name: 'Wundpflaster elastic 6 cm × 5 m', brand: 'Hartmann', articleNo: '9001234', annualQuantity: 2500, orderUnit: 'Rolle', unitsPerOrderUnit: 1, baseUnit: 'Rolle', gtin: '04046719222334', mdrClass: 'I', targetPrice: 1.75, currency: 'CHF' },
]

/** Attributes the LLM would extract from the hospital record (name + master data). */
export const REQUIREMENTS: Record<string, Attributes> = {
  '3': { Volume: '10 ml', Connector: 'Luer-Lock', Sterile: 'Yes', 'Pack size': '100', 'MDR class': 'IIa' },
  '6': { 'Size (Ø × length)': '0,8 × 40 mm', Gauge: '21 G', Sterile: 'Yes', 'Pack size': '100', 'MDR class': 'IIa' },
}

// From client/public/product_catalog_01.pdf (B. Braun) and product_catalog_02.pdf (BD)
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'bb-4617100V', hospitalArticleId: '3', supplier: 'B. Braun', name: 'Omnifix® Luer Lock Solo 10 ml', articleNo: '4617100V',
    source: 'product_catalog_01.pdf, p. 16',
    attributes: { Volume: '10 ml', Connector: 'Luer-Lock', Sterile: 'Yes', 'Pack size': '100', 'MDR class': null },
  },
  {
    id: 'bd-300912', hospitalArticleId: '3', supplier: 'BD', name: 'BD Plastipak™ Luer-Lok™ 10 ml', articleNo: '300912',
    source: 'product_catalog_02.pdf, p. 13',
    attributes: { Volume: '10 ml', Connector: 'Luer-Lock', Sterile: 'Yes', 'Pack size': '100', 'MDR class': null },
  },
  {
    id: 'bb-4657527B', hospitalArticleId: '6', supplier: 'B. Braun', name: 'Sterican® 21 G × 1½"', articleNo: '4657527B',
    source: 'product_catalog_01.pdf, p. 49',
    attributes: { 'Size (Ø × length)': '0,8 × 40 mm', Gauge: '21 G', Sterile: 'Yes', 'Pack size': '100', 'MDR class': null },
  },
  {
    id: 'bd-304432', hospitalArticleId: '6', supplier: 'BD', name: 'BD Microlance™ 21 G 1½" Nr. 2', articleNo: '304432',
    source: 'product_catalog_02.pdf, p. 6',
    attributes: { 'Size (Ø × length)': '0,8 × 40 mm', Gauge: '21 G', Sterile: 'Yes', 'Pack size': '100', 'MDR class': null },
  },
]
