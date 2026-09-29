import type { BaselineMetric, Benefit, PopulationPreset, Source } from '../types'

export const sources: Source[] = [
  {
    id: 'statfin-ntp-2026-09-18',
    organisation: 'Tilastokeskus',
    title: 'Kansantalouden tilinpito, julkaisukierros 18.9.2026',
    url: 'https://media.stat.fi/A7H6ohk0S8qafyCM4bfDaz/cmu2cj2oocaxt06w0xtrajyv8',
    updatedAt: '2026-09-18',
    note: 'Vuoden 2025 kansantalouden tilinpidon tiedot ovat ennakkotietoja.',
  },
  {
    id: 'statfin-15aj',
    organisation: 'Tilastokeskus',
    title: '15aj – Verot ja veronluonteiset maksut',
    url: 'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__ntp/15aj.px/',
    updatedAt: '2026-09-18',
    note: 'Kansantalouden tilinpidon verokäsitteet, ei kassaperusteinen verokertymä.',
  },
  {
    id: 'statfin-pop-2025',
    organisation: 'Tilastokeskus',
    title: '11rd – Väestö iän ja sukupuolen mukaan, 2025',
    url: 'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__vaerak/11rd.px/',
    updatedAt: '2026-04-01',
    note: 'Virallinen väkiluku 31.12.2025: 5 652 881.',
  },
  {
    id: 'statfin-working-age-2024',
    organisation: 'Tilastokeskus',
    title: '115g – Väestö pääasiallisen toiminnan ja iän mukaan, 2024',
    url: 'https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__tyokay/statfin_tyokay_pxt_115g.px/',
    updatedAt: '2025-12-17',
    note: '18–64-vuotiaita 3 293 886. Tämä on 2024 viitearvo, ei 2025 baseline-luku.',
  },
  {
    id: 'kela-benefits-2025',
    organisation: 'Kela',
    title: 'Kelan etuudet ja palvelut – etuusmenot 2025',
    url: 'https://www.kela.fi/etuudet-ja-palvelut',
    updatedAt: '2026-05-04',
    note: 'Kelan etuusmenot eivät kata kaikkea Suomen sosiaaliturvaa.',
  },
]

export const baselineMetrics: BaselineMetric[] = [
  {
    id: 'GOV-001', label: 'Julkisyhteisöjen tulot', value: 151221, unit: 'million_eur', period: '2025',
    evidence: 'accounting', sourceIds: ['statfin-ntp-2026-09-18'],
    definition: 'S13-julkisyhteisöjen sulautetut kokonaistulot (TOTREV).', status: 'ennakkotieto',
  },
  {
    id: 'GOV-002', label: 'Julkisyhteisöjen menot', value: 161966, unit: 'million_eur', period: '2025',
    evidence: 'accounting', sourceIds: ['statfin-ntp-2026-09-18'],
    definition: 'S13-julkisyhteisöjen sulautetut kokonaismenot (TOTEXP).', status: 'ennakkotieto',
  },
  {
    id: 'GOV-003', label: 'Rahoitusasema', value: -10745, unit: 'million_eur', period: '2025',
    evidence: 'accounting', sourceIds: ['statfin-ntp-2026-09-18'],
    definition: 'Nettoluotonanto (+) / nettoluotonotto (−), B9.', status: 'ennakkotieto',
  },
  {
    id: 'GOV-005', label: 'Rahana maksetut sosiaalietuudet', value: 53140, unit: 'million_eur', period: '2025',
    evidence: 'accounting', sourceIds: ['statfin-ntp-2026-09-18'],
    definition: 'D62K. Ei tarkoita kaikkia sosiaaliturvamenoja eikä Kelan etuusmenoja.', status: 'ennakkotieto',
  },
  {
    id: 'TAX-001', label: 'Verot ja veronluonteiset maksut', value: 119202, unit: 'million_eur', period: '2025',
    evidence: 'accounting', sourceIds: ['statfin-15aj', 'statfin-ntp-2026-09-18'],
    definition: '15aj-veroaggregaatti; vapaaehtoiset sosiaaliturvamaksut eivät sisälly.', status: 'ennakkotieto',
  },
  {
    id: 'MAC-001', label: 'Väkiluku', value: 5652881, unit: 'people', period: '31.12.2025',
    evidence: 'accounting', sourceIds: ['statfin-pop-2025'],
    definition: 'Suomessa vakinaisesti asuva väestö vuoden lopussa.', status: 'virallinen',
  },
]

export const populationPresets: PopulationPreset[] = [
  {
    id: 'all-2025', label: 'Kaikki vakituiset asukkaat', people: 5652881, period: '31.12.2025',
    evidence: 'accounting', sourceIds: ['statfin-pop-2025'],
    note: 'Virallinen vuoden 2025 lopun väkiluku.',
  },
  {
    id: '18-64-reference', label: '18–64-vuotiaat (viite)', people: 3293886, period: '31.12.2024',
    evidence: 'provisional', sourceIds: ['statfin-working-age-2024'],
    note: 'Tämä on vuoden 2024 viitearvo. 2025 ikäjakauma pitää ingestata ennen tuotantokäyttöä.',
  },
  {
    id: 'custom', label: 'Oma kohderyhmä', people: 0, period: 'käyttäjän syöte',
    evidence: 'provisional', sourceIds: [],
    note: 'Käyttäjän syöttämä kohderyhmän koko.',
  },
]

export const benefits: Benefit[] = [
  {
    id: 'kela-unemployment', name: 'Kelan työttömyysetuudet', annualCostMillionEur: 2071.1,
    defaultTreatment: 'recalculate', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: true,
    note: 'Aggregaatti pitää myöhemmin purkaa peruspäivärahaan, työmarkkinatukeen ym. ennen vakavaa politiikkalaskelmaa.',
    overlapWarning: 'Saajat limittyvät asumistuen ja toimeentulotuen kanssa.',
  },
  {
    id: 'housing', name: 'Yleinen asumistuki', annualCostMillionEur: 1228.0,
    defaultTreatment: 'recalculate', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: true,
    note: 'Kotitalous-, tulo- ja asumismenoriippuvainen etuus. Realistinen skenaario vaatii uudelleenlaskennan.',
    overlapWarning: 'Saajat limittyvät työttömyysetuuksien ja toimeentulotuen kanssa.',
  },
  {
    id: 'social-assistance', name: 'Perustoimeentulotuki', annualCostMillionEur: 1001.1,
    defaultTreatment: 'recalculate', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: true,
    note: 'Viimesijainen etuus. Pitäisi laskea muiden tulojen ja etuuksien jälkeen.',
    overlapWarning: 'Voimakas päällekkäisyys asumistuen ja työttömyysetuuksien kanssa.',
  },
  {
    id: 'student', name: 'Opintoetuudet', annualCostMillionEur: 1014.5,
    defaultTreatment: 'keep', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: false,
    note: 'Sisältää useita eri etuuksia. Ei käsitellä yhtenä korvattavana eränä tässä versiossa.',
  },
  {
    id: 'pensions-kela', name: 'Kelan eläke-etuudet', annualCostMillionEur: 2620.2,
    defaultTreatment: 'keep', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: false,
    note: 'Pidetään erillään työikäisten ensimmäisestä perustuloskenaariosta.',
  },
  {
    id: 'disability', name: 'Vammaistuet', annualCostMillionEur: 680.5,
    defaultTreatment: 'keep', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: false,
    note: 'Tarveperusteinen lisäkerros; ei oleteta perustulon korvaavan erityistarvetta.',
  },
  {
    id: 'family', name: 'Lapsiperheiden etuudet', annualCostMillionEur: 1807.6,
    defaultTreatment: 'keep', sourceIds: ['kela-benefits-2025'], directReplacementAllowed: false,
    note: 'Lapsi- ja perhekohtaiset etuudet tarvitsevat oman politiikkarajauksen.',
  },
]

export const sourceById = Object.fromEntries(sources.map((source) => [source.id, source]))
