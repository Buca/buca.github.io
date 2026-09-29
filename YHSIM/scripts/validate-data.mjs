import { readFile } from 'node:fs/promises'
import path from 'node:path'

const baseline = JSON.parse(await readFile(path.resolve('src/data/generated/baseline-2025.json'), 'utf8'))
const EXPECTED_TOTAL = 5_652_881
const EXPECTED_18_64 = 3_301_351

const fail = (message) => { throw new Error(`Data validation failed: ${message}`) }
const unique = (items) => new Set(items).size === items.length

if (baseline.schemaVersion !== 1) fail('unsupported schemaVersion')
if (!baseline.meta?.baselineId) fail('baselineId missing')
if (!/^[a-f0-9]{64}$/.test(baseline.meta?.inputHashes?.curatedSha256 ?? '')) fail('curated input hash missing/invalid')
if (!/^[a-f0-9]{64}$/.test(baseline.meta?.inputHashes?.populationSnapshotSha256 ?? '')) fail('population snapshot hash missing/invalid')

const sourceIds = baseline.sources.map((source) => source.id)
if (!unique(sourceIds)) fail('duplicate source IDs')
const sourceSet = new Set(sourceIds)

const metricIds = baseline.baselineMetrics.map((metric) => metric.id)
if (!unique(metricIds)) fail('duplicate baseline metric IDs')

const metric = (id) => baseline.baselineMetrics.find((item) => item.id === id)
const preset = (id) => baseline.populationPresets.find((item) => item.id === id)

if (metric('GOV-001')?.value - metric('GOV-002')?.value !== metric('GOV-003')?.value) {
  fail('GOV-001 − GOV-002 must equal GOV-003')
}

if (metric('MAC-001')?.value !== EXPECTED_TOTAL) fail(`MAC-001 should be ${EXPECTED_TOTAL}`)
if (preset('all-2025')?.people !== EXPECTED_TOTAL) fail(`all-2025 should be ${EXPECTED_TOTAL}`)
if (preset('18-64-2025')?.people !== EXPECTED_18_64) fail(`18-64-2025 should be ${EXPECTED_18_64}`)
if (preset('18-64-2025')?.period !== '2025-12-31') fail('18-64 preset must use 31.12.2025')

for (const collection of [baseline.baselineMetrics, baseline.populationPresets, baseline.benefits]) {
  for (const item of collection) {
    for (const sourceId of item.sourceIds ?? []) {
      if (!sourceSet.has(sourceId)) fail(`${item.id} references missing source ${sourceId}`)
    }
  }
}

for (const benefit of baseline.benefits) {
  if (!Number.isFinite(benefit.annualCostMillionEur) || benefit.annualCostMillionEur < 0) {
    fail(`${benefit.id} has invalid annualCostMillionEur`)
  }
}

const gross800 = (EXPECTED_18_64 * 800 * 12) / 1_000_000
if (Math.abs(gross800 - 31_692.9696) > 1e-9) fail('800 €/month gross-cost smoke check failed')

console.log('Data validation OK')
console.log(`Baseline ID: ${baseline.meta.baselineId}`)
console.log(`Population total: ${EXPECTED_TOTAL.toLocaleString('fi-FI')}`)
console.log(`Population 18–64: ${EXPECTED_18_64.toLocaleString('fi-FI')}`)
console.log(`800 €/month gross cost for 18–64: ${(gross800 / 1000).toFixed(3)} bn €/year`)
