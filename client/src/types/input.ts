export type DynamicInputDataType = 'BOOLEAN' | 'NUMBER_WITH_UNIT' | 'ENUM' | 'TEXT'

export interface AttributeSchema {
  key: string
  label: string
  dataType: DynamicInputDataType
  options?: string[]
  unit?: string
  allowedUnits?: string[]
  hospitalTargetValue?: string | number | boolean | null
  description?: string
  placeholder?: string
}

export interface NumberWithUnitValue {
  value: number | null
  unit?: string
}

export type DynamicInputValue =
  | boolean
  | number
  | string
  | NumberWithUnitValue
  | null
  | undefined
