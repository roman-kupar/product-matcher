import type {
  TriageItem,
  NormalizedArticle,
  AuditLogEntry,
  AttributeComparisonRow,
  AttributeSchema,
  ClarificationPacket,
  StatusTabConfig,
} from '../types'

export const INITIAL_TRIAGE_DATA: TriageItem[] = [
  {
    id: '1',
    key: '1',
    articleId: 'ART-9041',
    buyerArticle: 'Industrial Hex Bolt M8x40 (Steel 8.8)',
    supplierArticle: 'Hex Head Screw DIN 933 M8x40 8.8 Galvanized',
    status: 'MATCHED',
    score: 96,
    deltaScore: 18,
  },
  {
    id: '2',
    key: '2',
    articleId: 'ART-8820',
    buyerArticle: 'Hydraulic Seal Ring 25x35x7 NBR',
    supplierArticle: 'Radial Shaft Seal 25-35-7 NBR Standard',
    status: 'RE_EVALUATED',
    score: 84,
    deltaScore: 12,
  },
  {
    id: '3',
    key: '3',
    articleId: 'ART-7712',
    buyerArticle: 'LED Indicator 24V Green IP67',
    supplierArticle: 'Pilot Lamp 24V Green IP65',
    status: 'NEEDS_INFO',
    score: 62,
  },
  {
    id: '4',
    key: '4',
    articleId: 'ART-6540',
    buyerArticle: 'Circuit Breaker 16A Type C 3-Pole',
    supplierArticle: 'MCB 16A 3P Curve B 6kA',
    status: 'CONFLICT',
    score: 41,
    deltaScore: -14,
  },
  {
    id: '5',
    key: '5',
    articleId: 'ART-5401',
    buyerArticle: 'Ball Bearing 6204 2RS C3',
    supplierArticle: 'Deep Groove Ball Bearing 6204-ZZ',
    status: 'AWAITING_SUPPLIER',
    score: 71,
  },
]

export const SAMPLE_HOSPITAL_ARTICLE: NormalizedArticle = {
  id: 'HOSP-10042',
  title: 'Surgical Gloves Powder-Free Sterile Size 7.5 Latex',
  sku: 'SG-75-LAT-PF',
  gtin: '04012345678901',
  manufacturer: 'Hartmann MedTech AG',
  packagingUnit: 'Box of 50 pairs',
}

export const SAMPLE_SUPPLIER_ARTICLE: NormalizedArticle = {
  id: 'SUPP-9921',
  title: 'Peha-soft Powder-Free Surgical Latex Gloves Sz 7.5',
  sku: '942204-PF',
  gtin: '04012345678901',
  manufacturer: 'Hartmann MedTech AG',
  packagingUnit: 'Box of 50 pairs (dispenser carton)',
}

export const SAMPLE_AUDIT_EVENTS: AuditLogEntry[] = [
  {
    id: 'evt-1',
    timestamp: '2026-11-20 09:14',
    type: 'INITIAL_SCAN',
    title: 'Initial LLM Extraction & Matching',
    actor: { name: 'Gemini Pipeline v2.4', role: 'LLM' },
    summary: 'Catalog cross-reference completed. Candidate match identified with score 62% (status: NEEDS_INFO due to missing sterility standard).',
    fieldChanges: [
      { field: 'Equivalence Score', newValue: '62%' },
      { field: 'Equivalence Status', newValue: 'NEEDS_INFO' },
    ],
  },
  {
    id: 'evt-2',
    timestamp: '2026-11-20 11:30',
    type: 'QUESTIONS_SENT',
    title: 'Clarification Questionnaire Dispatched',
    actor: { name: 'Sarah L. (Procurement Lead)', role: 'BUYER' },
    summary: 'Automated questionnaire sent to supplier requesting EN 455 sterile certification and exact carton packaging units.',
  },
  {
    id: 'evt-3',
    timestamp: '2026-11-21 08:45',
    type: 'SUPPLIER_ANSWERED',
    title: 'Supplier Specification Submission',
    actor: { name: 'Hartmann MedTech Rep (Klaus V.)', role: 'SUPPLIER' },
    summary: 'Supplier confirmed sterile gamma radiation certification and updated packaging hierarchy.',
    fieldChanges: [
      { field: 'Packaging Unit', previousValue: 'Box of 50', newValue: 'Box of 50 pairs (dispenser carton)' },
      { field: 'Sterility Standard', previousValue: 'Unspecified', newValue: 'EN 455-1/-2 Sterile Gamma' },
    ],
  },
  {
    id: 'evt-4',
    timestamp: '2026-11-21 08:46',
    type: 'LLM_RE_EVALUATED',
    title: 'Automated Re-evaluation & Verification',
    actor: { name: 'Gemini Pipeline v2.4', role: 'LLM' },
    summary: 'Extracted attributes verified against hospital master spec. Match confidence escalated to 96% with full equivalence verified.',
    fieldChanges: [
      { field: 'Equivalence Score', previousValue: '62%', newValue: '96%' },
      { field: 'Score Delta', newValue: '+34%' },
      { field: 'Equivalence Status', previousValue: 'NEEDS_INFO', newValue: 'MATCHED' },
    ],
    notes: 'All mandatory hospital clinical requirements satisfied.',
  },
]

export const SAMPLE_ATTRIBUTE_COMPARISON: AttributeComparisonRow[] = [
  {
    key: 'size_nominal',
    label: 'Glove Size (Nominal)',
    dataType: 'STRING',
    hospitalValue: '7.5 (Medium-Large)',
    supplierValue: '7.5 (Medium-Large)',
    status: 'EXACT_MATCH',
    isClinicalDealbreaker: true,
    llmNote: 'Exact dimensional match verified across both specifications.',
  },
  {
    key: 'material_composition',
    label: 'Material Composition',
    dataType: 'ENUM',
    enumOptions: ['Natural Rubber Latex', 'Nitrile', 'Neoprene', 'Polyisoprene'],
    hospitalValue: 'Natural Rubber Latex (Low Protein)',
    supplierValue: 'Natural Rubber Latex (Low Protein)',
    previousSupplierValue: 'Natural Rubber Latex',
    status: 'EXACT_MATCH',
    isClinicalDealbreaker: true,
    llmNote: 'Supplier submitted low protein certification (<50 µg/g per EN 455-3).',
    enrichmentSource: 'SUPPLIER_RESPONSE',
    updatedBySupplier: true,
  },
  {
    key: 'sterility_status',
    label: 'Sterility & Method',
    dataType: 'ENUM',
    enumOptions: ['Sterile Gamma', 'Sterile EtO', 'Non-Sterile'],
    hospitalValue: 'Sterile Gamma Radiation (EN 556-1)',
    supplierValue: null,
    status: 'MISSING_DATA',
    isClinicalDealbreaker: true,
    llmNote: 'Supplier catalog does not explicitly state sterilization protocol. Clarification required.',
  },
  {
    key: 'cuff_thickness',
    label: 'Cuff Thickness',
    dataType: 'NUMBER_WITH_UNIT',
    unit: 'mm',
    hospitalValue: 0.22,
    supplierValue: 0.20,
    status: 'SOFT_MISMATCH',
    isClinicalDealbreaker: false,
    llmNote: 'Minor 0.02mm variance within clinical tolerance of ±0.03mm (ASTM D3577).',
  },
  {
    key: 'powder_content',
    label: 'Powder Status',
    dataType: 'BOOLEAN',
    hospitalValue: false,
    supplierValue: true,
    status: 'CLINICAL_CONFLICT',
    isClinicalDealbreaker: true,
    llmNote: 'Hospital requires 100% Powder-Free for OR surgical use; candidate is Lightly Powdered.',
  },
]

export const SAMPLE_SCHEMAS: AttributeSchema[] = [
  {
    key: 'latex_free',
    label: 'Latex-Free Clinical Rating',
    dataType: 'BOOLEAN',
    hospitalTargetValue: true,
  },
  {
    key: 'cuff_length',
    label: 'Cuff Length Specification',
    dataType: 'NUMBER_WITH_UNIT',
    unit: 'mm',
    allowedUnits: ['mm', 'cm'],
    hospitalTargetValue: 290,
  },
  {
    key: 'iso_certification',
    label: 'ISO & Clinical Standard',
    dataType: 'ENUM',
    options: ['ISO 13485:2016', 'ISO 9001:2015', 'EN 455-1/-2/-3', 'ASTM D3577'],
    hospitalTargetValue: 'EN 455-1/-2/-3',
  },
  {
    key: 'packaging_carton_code',
    label: 'Secondary Carton GTIN',
    dataType: 'TEXT',
    placeholder: 'e.g. 04012345678901',
    hospitalTargetValue: '04012345678901',
  },
]

export const SAMPLE_CLARIFICATION_PACKET: ClarificationPacket = {
  id: 'pkt-2026-001',
  comparisonId: 'CMP-7712',
  buyerNotes: 'Please confirm sterilization parameters and provide packaging GTIN so we can clear this item for OR inventory.',
  items: [
    {
      id: 'cl-1',
      attributeKey: 'sterility_status',
      schema: {
        key: 'sterility_status',
        label: 'Sterility & Method',
        dataType: 'ENUM',
        options: ['Sterile Gamma Radiation (EN 556-1)', 'Sterile EtO (Ethylene Oxide)', 'Non-Sterile (Bulk)'],
        hospitalTargetValue: 'Sterile Gamma Radiation (EN 556-1)',
      },
      llmGeneratedQuestion: 'Does the candidate item undergo terminal gamma radiation sterilization matching hospital protocol EN 556-1?',
      isDealbreaker: true,
      selected: true,
    },
    {
      id: 'cl-2',
      attributeKey: 'latex_free',
      schema: {
        key: 'latex_free',
        label: 'Latex-Free Clinical Rating',
        dataType: 'BOOLEAN',
        hospitalTargetValue: true,
      },
      llmGeneratedQuestion: 'Please verify whether the product is 100% natural rubber latex-free per FDA / MDR guidelines.',
      isDealbreaker: true,
      selected: true,
    },
    {
      id: 'cl-3',
      attributeKey: 'cuff_length',
      schema: {
        key: 'cuff_length',
        label: 'Cuff Length Specification',
        dataType: 'NUMBER_WITH_UNIT',
        unit: 'mm',
        allowedUnits: ['mm', 'cm'],
        hospitalTargetValue: 290,
      },
      llmGeneratedQuestion: 'Can you specify the total sleeve/cuff length in millimeters for sizing validation?',
      isDealbreaker: false,
      selected: true,
    },
  ],
}

export const STATUS_TABS: StatusTabConfig<TriageItem>[] = [
  {
    key: 'ALL',
    label: 'All Items',
  },
  {
    key: 'ACTION_REQUIRED',
    label: 'Action Required',
    filterFn: (item) => item.status === 'NEEDS_INFO' || item.status === 'CONFLICT',
  },
  {
    key: 'PENDING_SUPPLIER',
    label: 'Pending Supplier',
    filterFn: (item) => item.status === 'AWAITING_SUPPLIER',
  },
  {
    key: 'RESOLVED',
    label: 'Resolved',
    filterFn: (item) => item.status === 'MATCHED' || item.status === 'RE_EVALUATED',
  },
]
