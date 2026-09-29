import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex')
const curatedPath = path.resolve('data/curated/baseline-2025.curated.json')
const populationPath = path.resolve('data/snapshots/statfin/11rd-2025.normalized.json')
const outPath = path.resolve('src/data/generated/baseline-2025.json')

const [curatedBytes, populationBytes] = await Promise.all([readFile(curatedPath), readFile(populationPath)])
const curated = JSON.parse(curatedBytes.toString('utf8'))
const population = JSON.parse(populationBytes.toString('utf8'))

const populationSource = {
  id: population.source.id,
  organisation: population.source.organisation,
  title: population.source.title,
  url: population.source.url,
  updatedAt: population.source.updatedAt,
  note: `${population.source.note} 18–64-vuotiaat on johdettu summaamalla yksivuotisiät 18–64.`,
}

const generated = {
  schemaVersion: 1,
  meta: {
    baselineId: `FI-2025-ntp-${curated.nationalAccountsRelease}-pop-${population.source.updatedAt}`,
    baselineYear: 2025,
    nationalAccountsRelease: curated.nationalAccountsRelease,
    populationRelease: population.source.updatedAt,
    populationTable: population.source.tableId,
    populationReferencePeriod: population.referencePeriod,
    inputHashes: {
      curatedSha256: sha256(curatedBytes),
      populationSnapshotSha256: sha256(populationBytes),
    },
  },
  sources: [...curated.sources, populationSource],
  baselineMetrics: [
    ...curated.baselineMetrics,
    {
      id: 'MAC-001',
      label: 'Väkiluku',
      value: population.totalPopulation,
      unit: 'people',
      period: population.referencePeriod,
      evidence: 'accounting',
      sourceIds: [population.source.id],
      definition: 'Suomessa vakinaisesti asuva väestö vuoden lopussa.',
      status: 'virallinen',
    },
  ],
  populationPresets: [
    {
      id: 'all-2025',
      label: 'Kaikki vakituiset asukkaat',
      people: population.totalPopulation,
      period: population.referencePeriod,
      evidence: 'accounting',
      sourceIds: [population.source.id],
      note: 'Virallinen vuoden 2025 lopun väkiluku.',
    },
    {
      id: '18-64-2025',
      label: '18–64-vuotiaat',
      people: population.age18To64,
      period: population.referencePeriod,
      evidence: 'accounting',
      sourceIds: [population.source.id],
      note: `Johdettu 11rd-taulukosta summaamalla yksivuotisiät ${population.ageRange.min}–${population.ageRange.max}.`,
    },
    {
      id: 'custom',
      label: 'Oma kohderyhmä',
      people: 0,
      period: 'käyttäjän syöte',
      evidence: 'provisional',
      sourceIds: [],
      note: 'Käyttäjän syöttämä kohderyhmän koko.',
    },
  ],
  benefits: curated.benefits,
}

await mkdir(path.dirname(outPath), { recursive: true })
await writeFile(outPath, `${JSON.stringify(generated, null, 2)}\n`)
console.log(`Built ${outPath}`)
console.log(`Baseline: ${generated.meta.baselineId}`)
console.log(`18–64: ${population.age18To64.toLocaleString('fi-FI')}`)
