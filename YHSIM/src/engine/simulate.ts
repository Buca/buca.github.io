import { benefits, populationPresets } from '../data/baseline'
import type { Scenario, SimulationResult } from '../types'

export const createDefaultScenario = (): Scenario => ({
  monthlyAmountEur: 800,
  taxable: true,
  populationPresetId: '18-64-reference',
  customPopulation: 1_000_000,
  benefitTreatments: Object.fromEntries(benefits.map((benefit) => [benefit.id, benefit.defaultTreatment])),
})

export function simulateScenario(scenario: Scenario): SimulationResult {
  const preset = populationPresets.find((candidate) => candidate.id === scenario.populationPresetId)
  const eligiblePopulation = scenario.populationPresetId === 'custom'
    ? Math.max(0, Math.round(scenario.customPopulation || 0))
    : preset?.people ?? 0

  const monthlyAmount = Math.max(0, scenario.monthlyAmountEur || 0)
  const grossCostMillionEur = (eligiblePopulation * monthlyAmount * 12) / 1_000_000

  const replaced = benefits.filter((benefit) => scenario.benefitTreatments[benefit.id] === 'replace')
  const mechanicalOffsetsMillionEur = replaced
    .filter((benefit) => benefit.directReplacementAllowed)
    .reduce((sum, benefit) => sum + benefit.annualCostMillionEur, 0)

  const unresolved: string[] = []
  if (scenario.taxable) unresolved.push('Perustulon verovaikutus vaatii vero- ja kotitalousmallin.')
  else unresolved.push('Verovapauden rahoitus- ja tulonjakovaikutusta ei ole vielä mallinnettu.')

  benefits.forEach((benefit) => {
    const treatment = scenario.benefitTreatments[benefit.id]
    if (treatment === 'recalculate') {
      unresolved.push(`${benefit.name}: lasketaan uudelleen henkilö-/kotitaloustasolla.`)
    }
    if (treatment === 'replace' && !benefit.directReplacementAllowed) {
      unresolved.push(`${benefit.name}: koko aggregaattia ei voi vielä käyttää suorana korvauseränä.`)
    }
  })

  unresolved.push('Työn tarjonnan ja muiden käyttäytymisvaikutusten arvio ei kuulu tähän staattiseen versioon.')

  return {
    eligiblePopulation,
    grossCostMillionEur,
    mechanicalOffsetsMillionEur,
    mechanicalBalanceBeforeTaxesMillionEur: grossCostMillionEur - mechanicalOffsetsMillionEur,
    unresolved,
    lines: [
      {
        id: 'gross-cost',
        label: 'Perustulon bruttokustannus',
        valueMillionEur: grossCostMillionEur,
        evidence: preset?.evidence === 'provisional' ? 'provisional' : 'accounting',
        formula: 'kohderyhmän koko × €/kk × 12',
        inputs: [`${eligiblePopulation.toLocaleString('fi-FI')} henkilöä`, `${monthlyAmount.toLocaleString('fi-FI')} €/kk`],
        sourceIds: preset?.sourceIds ?? [],
        note: preset?.note,
      },
      {
        id: 'mechanical-offsets',
        label: 'Täysin korvattaviksi valitut etuusmenot',
        valueMillionEur: mechanicalOffsetsMillionEur,
        evidence: 'accounting',
        formula: 'summa niistä vuoden 2025 etuusmenoista, jotka käyttäjä on nimenomaisesti valinnut poistettaviksi',
        inputs: replaced.filter((benefit) => benefit.directReplacementAllowed).map((benefit) => benefit.name),
        sourceIds: [...new Set(replaced.flatMap((benefit) => benefit.sourceIds))],
        note: 'Tämä on mekaaninen budjettierä, ei nettovaikutus. Uudelleenlaskettavia etuuksia ei vähennetä tässä.',
      },
      {
        id: 'pre-tax-balance',
        label: 'Mekaaninen kustannus ennen veroja ja uudelleenlaskentaa',
        valueMillionEur: grossCostMillionEur - mechanicalOffsetsMillionEur,
        evidence: 'simulation',
        formula: 'bruttokustannus − täysin poistettaviksi valitut etuusmenot',
        inputs: ['bruttokustannus', 'mekaaniset korvauserät'],
        sourceIds: [],
        note: 'Tätä ei pidä kutsua perustulon nettokustannukseksi.',
      },
    ],
  }
}
