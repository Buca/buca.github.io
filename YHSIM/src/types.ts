export type EvidenceLevel = 'accounting' | 'simulation' | 'research' | 'provisional'


export type BaselineMeta = {
  baselineId: string
  baselineYear: number
  nationalAccountsRelease: string
  populationRelease: string
  populationTable: string
  populationReferencePeriod: string
  inputHashes: {
    curatedSha256: string
    populationSnapshotSha256: string
  }
}

export type Source = {
  id: string
  organisation: string
  title: string
  url: string
  updatedAt: string
  note?: string
}

export type BaselineMetric = {
  id: string
  label: string
  value: number
  unit: 'million_eur' | 'people'
  period: string
  evidence: EvidenceLevel
  sourceIds: string[]
  definition: string
  status: string
}

export type BenefitTreatment = 'keep' | 'replace' | 'recalculate'

export type Benefit = {
  id: string
  name: string
  annualCostMillionEur: number
  defaultTreatment: BenefitTreatment
  sourceIds: string[]
  directReplacementAllowed: boolean
  note: string
  overlapWarning?: string
}

export type PopulationPreset = {
  id: string
  label: string
  people: number
  period: string
  evidence: EvidenceLevel
  sourceIds: string[]
  note: string
}

export type Scenario = {
  monthlyAmountEur: number
  taxable: boolean
  populationPresetId: string
  customPopulation: number
  benefitTreatments: Record<string, BenefitTreatment>
}

export type CalculationLine = {
  id: string
  label: string
  valueMillionEur: number | null
  evidence: EvidenceLevel
  formula: string
  inputs: string[]
  sourceIds: string[]
  note?: string
}

export type SimulationResult = {
  eligiblePopulation: number
  grossCostMillionEur: number
  mechanicalOffsetsMillionEur: number
  mechanicalBalanceBeforeTaxesMillionEur: number
  unresolved: string[]
  lines: CalculationLine[]
}
