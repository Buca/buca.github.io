import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  buildQuery,
  fetchJson,
  findAgeCodes,
  findValueCode,
  findVariable,
  numericValues,
} from './lib/pxweb.mjs'

const YEAR = 2025
const MIN_AGE = 18
const MAX_AGE = 64
const EXPECTED_TOTAL = 5_652_881
const EXPECTED_18_64 = 3_301_351
const API_URL = 'https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/vaerak/11rd.px'
const UI_URL = 'https://pxdata.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__vaerak/11rd.px/'
const OUT_DIR = path.resolve('data/snapshots/statfin')

await mkdir(OUT_DIR, { recursive: true })

console.log(`Fetching PxWeb metadata: ${API_URL}`)
const metadata = await fetchJson(API_URL)

const yearVar = findVariable(metadata, { codes: ['timeperiod_y'], texts: ['Year', 'Vuosi'] })
const sexVar = findVariable(metadata, { texts: ['Sex', 'Sukupuoli'] })
const ageVar = findVariable(metadata, { texts: ['Age', 'Ikä'] })
const infoVar = findVariable(metadata, { codes: ['contentscode'], texts: ['Information', 'Tiedot'] })

const yearCode = findValueCode(yearVar, String(YEAR), [String(YEAR)])
const totalSexCode = findValueCode(sexVar, 'Total', ['SSS'])
const totalAgeCode = findValueCode(ageVar, 'Total', ['SSS'])
const ageCodes = findAgeCodes(ageVar, MIN_AGE, MAX_AGE)
const infoCode = infoVar.values?.[0]
if (!infoCode) throw new Error('11rd Information variable has no value code.')

const common = new Map([
  [yearVar.code, [yearCode]],
  [sexVar.code, [totalSexCode]],
  [infoVar.code, [infoCode]],
])

const rangeSelections = new Map(common)
rangeSelections.set(ageVar.code, ageCodes)
const rangeQuery = buildQuery(metadata, rangeSelections)

const totalSelections = new Map(common)
totalSelections.set(ageVar.code, [totalAgeCode])
const totalQuery = buildQuery(metadata, totalSelections)

console.log(`Fetching ${MIN_AGE}–${MAX_AGE} ages from 11rd...`)
const [rangeResponse, totalResponse] = await Promise.all([
  fetchJson(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rangeQuery),
  }),
  fetchJson(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(totalQuery),
  }),
])

const rangeValues = numericValues(rangeResponse)
const totalValues = numericValues(totalResponse)

if (rangeValues.length !== MAX_AGE - MIN_AGE + 1) {
  throw new Error(`Expected 47 one-year age cells, received ${rangeValues.length}.`)
}
if (totalValues.length !== 1) {
  throw new Error(`Expected one total-population cell, received ${totalValues.length}.`)
}

const age18To64 = rangeValues.reduce((sum, value) => sum + value, 0)
const totalPopulation = totalValues[0]

if (!Number.isInteger(age18To64) || !Number.isInteger(totalPopulation)) {
  throw new Error('Population values must be integer counts.')
}
if (totalPopulation !== EXPECTED_TOTAL) {
  throw new Error(`2025 total-population validation failed: expected ${EXPECTED_TOTAL}, got ${totalPopulation}.`)
}
if (age18To64 !== EXPECTED_18_64) {
  throw new Error(`2025 age 18–64 validation failed: expected ${EXPECTED_18_64}, got ${age18To64}.`)
}

const sourceUpdatedAt = (() => {
  const candidate = rangeResponse?.updated ?? totalResponse?.updated ?? metadata?.updated
  if (typeof candidate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(candidate)) return candidate.slice(0, 10)
  return '2026-04-01'
})()

const normalized = {
  schemaVersion: 1,
  source: {
    id: 'statfin-pop-11rd-2025',
    organisation: 'Tilastokeskus',
    title: '11rd – Väestö iän (1-vuotisikä) ja sukupuolen mukaan, 1972–2025',
    tableId: '11rd',
    apiUrl: API_URL,
    url: UI_URL,
    updatedAt: sourceUpdatedAt,
    note: 'Ikä tarkoittaa ikää täysinä vuosina 31.12. Väkiluku on tilastovuoden lopun vakinaisesti asuva väestö.',
  },
  referencePeriod: '2025-12-31',
  year: YEAR,
  totalPopulation,
  age18To64,
  ageRange: { min: MIN_AGE, max: MAX_AGE, ageCount: rangeValues.length },
  verification: {
    status: 'live_api_validated',
    expectedTotal: EXPECTED_TOTAL,
    expectedAge18To64: EXPECTED_18_64,
    queryVariableCodes: {
      year: yearVar.code,
      sex: sexVar.code,
      age: ageVar.code,
      information: infoVar.code,
    },
    note: '18–64 lasketaan summaamalla 11rd-taulukon yksivuotiset iät 18, 19, …, 64; sukupuoli = Total.',
  },
}

const pretty = (value) => `${JSON.stringify(value, null, 2)}\n`
await Promise.all([
  writeFile(path.join(OUT_DIR, '11rd-2025.metadata.json'), pretty(metadata)),
  writeFile(path.join(OUT_DIR, '11rd-2025.age18-64.query.json'), pretty(rangeQuery)),
  writeFile(path.join(OUT_DIR, '11rd-2025.age18-64.jsonstat2.json'), pretty(rangeResponse)),
  writeFile(path.join(OUT_DIR, '11rd-2025.total.query.json'), pretty(totalQuery)),
  writeFile(path.join(OUT_DIR, '11rd-2025.total.jsonstat2.json'), pretty(totalResponse)),
  writeFile(path.join(OUT_DIR, '11rd-2025.normalized.json'), pretty(normalized)),
])

console.log(`OK: ${MIN_AGE}–${MAX_AGE} = ${age18To64.toLocaleString('fi-FI')}; total = ${totalPopulation.toLocaleString('fi-FI')}`)
