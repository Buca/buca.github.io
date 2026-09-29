import { useMemo, useState } from 'react'
import { baselineMeta, baselineMetrics, benefits, populationPresets, sources } from './data/baseline'
import { createDefaultScenario, simulateScenario } from './engine/simulate'
import type { BenefitTreatment, EvidenceLevel } from './types'
import { MetricCard } from './components/MetricCard'
import { SourceList } from './components/SourceList'
import './styles.css'

const money = (millionEur: number) => {
  const billions = millionEur / 1000
  return `${billions.toLocaleString('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mrd €`
}

const evidenceLabels: Record<EvidenceLevel, string> = {
  accounting: 'kirjanpitoluku',
  simulation: 'staattinen laskenta',
  research: 'tutkimusarvio',
  provisional: 'viite / tarkennettava',
}

const treatmentLabels: Record<BenefitTreatment, string> = {
  keep: 'säilyy',
  replace: 'korvataan kokonaan',
  recalculate: 'lasketaan uudelleen',
}

export default function App() {
  const [scenario, setScenario] = useState(createDefaultScenario)
  const [activeTab, setActiveTab] = useState<'simulator' | 'baseline' | 'sources'>('simulator')

  const result = useMemo(() => simulateScenario(scenario), [scenario])
  const populationPreset = populationPresets.find((preset) => preset.id === scenario.populationPresetId)

  const updateTreatment = (id: string, treatment: BenefitTreatment) => {
    setScenario((previous) => ({
      ...previous,
      benefitTreatments: { ...previous.benefitTreatments, [id]: treatment },
    }))
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="kicker">Suomi · avoin prototyyppi v0.2</span>
          <h1>Yhteiskuntasimulaattori</h1>
          <p>
            Kokeile perustuloskenaariota niin, että jokainen numero kertoo mistä se tulee — ja epävarmat kohdat jäävät näkyvästi epävarmoiksi.
          </p>
        </div>
        <div className="hero-badge">
          <span>Baseline</span>
          <strong>2025</strong>
          <small>versionoitu snapshot</small>
        </div>
      </header>

      <nav className="tabs" aria-label="Päänavigaatio">
        <button className={activeTab === 'simulator' ? 'active' : ''} onClick={() => setActiveTab('simulator')}>Simulaattori</button>
        <button className={activeTab === 'baseline' ? 'active' : ''} onClick={() => setActiveTab('baseline')}>Nykytila</button>
        <button className={activeTab === 'sources' ? 'active' : ''} onClick={() => setActiveTab('sources')}>Lähteet</button>
      </nav>

      {activeTab === 'simulator' && (
        <main className="simulator-grid">
          <section className="panel controls-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Skenaario</span>
                <h2>Perustulo</h2>
              </div>
              <button className="ghost-button" onClick={() => setScenario(createDefaultScenario())}>Palauta oletukset</button>
            </div>

            <label className="field-block">
              <span className="field-label">Perustulo kuukaudessa</span>
              <div className="range-row">
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="25"
                  value={scenario.monthlyAmountEur}
                  onChange={(event) => setScenario({ ...scenario, monthlyAmountEur: Number(event.target.value) })}
                />
                <div className="money-input-wrap">
                  <input
                    className="money-input"
                    type="number"
                    min="0"
                    max="5000"
                    step="25"
                    value={scenario.monthlyAmountEur}
                    onChange={(event) => setScenario({ ...scenario, monthlyAmountEur: Math.max(0, Number(event.target.value) || 0) })}
                  />
                  <span>€/kk</span>
                </div>
              </div>
            </label>

            <label className="field-block">
              <span className="field-label">Kohderyhmä</span>
              <select
                value={scenario.populationPresetId}
                onChange={(event) => setScenario({ ...scenario, populationPresetId: event.target.value })}
              >
                {populationPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select>
              {scenario.populationPresetId === 'custom' ? (
                <input
                  className="custom-population"
                  type="number"
                  min="0"
                  max="10000000"
                  value={scenario.customPopulation}
                  onChange={(event) => setScenario({ ...scenario, customPopulation: Math.max(0, Number(event.target.value) || 0) })}
                  aria-label="Kohderyhmän henkilömäärä"
                />
              ) : null}
              <small className={populationPreset?.evidence === 'provisional' ? 'warning-copy' : 'helper-copy'}>
                {populationPreset?.people.toLocaleString('fi-FI')} henkilöä · {populationPreset?.period}. {populationPreset?.note}
              </small>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={scenario.taxable}
                onChange={(event) => setScenario({ ...scenario, taxable: event.target.checked })}
              />
              <span>
                <strong>Perustulo on veronalaista</strong>
                <small>Verovaikutusta ei vielä lasketa tässä prototyypissä.</small>
              </span>
            </label>

            <div className="benefits-heading">
              <span className="eyebrow">Nykyiset etuudet</span>
              <h3>Mitä niille tapahtuu?</h3>
              <p>“Lasketaan uudelleen” tarkoittaa, ettei koko vuoden 2025 menoa vähennetä mekaanisesti.</p>
            </div>

            <div className="benefit-list">
              {benefits.map((benefit) => (
                <div className="benefit-row" key={benefit.id}>
                  <div>
                    <strong>{benefit.name}</strong>
                    <span>{money(benefit.annualCostMillionEur)} / 2025</span>
                  </div>
                  <select
                    value={scenario.benefitTreatments[benefit.id]}
                    onChange={(event) => updateTreatment(benefit.id, event.target.value as BenefitTreatment)}
                    aria-label={`${benefit.name}: käsittely`}
                  >
                    <option value="keep">{treatmentLabels.keep}</option>
                    <option value="recalculate">{treatmentLabels.recalculate}</option>
                    <option value="replace" disabled={!benefit.directReplacementAllowed}>{treatmentLabels.replace}</option>
                  </select>
                  <details>
                    <summary>Miksi?</summary>
                    <p>{benefit.note}</p>
                    {benefit.overlapWarning ? <p className="warning-copy">{benefit.overlapWarning}</p> : null}
                    <SourceList sourceIds={benefit.sourceIds} />
                  </details>
                </div>
              ))}
            </div>
          </section>

          <section className="results-stack" aria-live="polite">
            <article className="panel result-hero">
              <span className="eyebrow">Bruttokustannus</span>
              <strong className="big-number">{money(result.grossCostMillionEur)}</strong>
              <span className="result-subline">vuodessa · {result.eligiblePopulation.toLocaleString('fi-FI')} henkilöä</span>
              <div className="equation">
                {result.eligiblePopulation.toLocaleString('fi-FI')} × {scenario.monthlyAmountEur.toLocaleString('fi-FI')} € × 12
              </div>
              <span className={`evidence-badge ${populationPreset?.evidence === 'provisional' ? 'provisional' : ''}`}>
                {evidenceLabels[populationPreset?.evidence ?? 'provisional']}
              </span>
            </article>

            <article className="panel result-breakdown">
              <div className="breakdown-row">
                <span>Bruttokustannus</span>
                <strong>{money(result.grossCostMillionEur)}</strong>
              </div>
              <div className="breakdown-row negative">
                <span>Täysin poistettaviksi valitut etuusmenot</span>
                <strong>− {money(result.mechanicalOffsetsMillionEur)}</strong>
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-row total">
                <span>Mekaaninen kustannus ennen veroja</span>
                <strong>{money(result.mechanicalBalanceBeforeTaxesMillionEur)}</strong>
              </div>
              <p className="callout-warning"><strong>Ei nettokustannus.</strong> Verotus, uudelleenlaskettavat etuudet ja käyttäytymisvaikutukset puuttuvat.</p>
            </article>

            <article className="panel unresolved-panel">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">Auki olevat kohdat</span>
                  <h3>{result.unresolved.length} asiaa ennen nettovaikutusta</h3>
                </div>
              </div>
              <ul>
                {result.unresolved.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>

            <article className="panel audit-panel">
              <span className="eyebrow">Audit trail</span>
              <h3>Miten luvut laskettiin?</h3>
              {result.lines.map((line) => (
                <details key={line.id} className="audit-item">
                  <summary>
                    <span>{line.label}</span>
                    <strong>{line.valueMillionEur === null ? 'ei laskettu' : money(line.valueMillionEur)}</strong>
                  </summary>
                  <div className="audit-body">
                    <span className="evidence-badge">{evidenceLabels[line.evidence]}</span>
                    <p><strong>Kaava:</strong> {line.formula}</p>
                    {line.inputs.length ? <p><strong>Syötteet:</strong> {line.inputs.join(' · ')}</p> : null}
                    {line.note ? <p>{line.note}</p> : null}
                    <SourceList sourceIds={line.sourceIds} />
                  </div>
                </details>
              ))}
            </article>
          </section>
        </main>
      )}

      {activeTab === 'baseline' && (
        <main className="baseline-view">
          <div className="section-heading wide-heading">
            <div>
              <span className="eyebrow">Baseline {baselineMeta.baselineId}</span>
              <h2>Suomen nykytila</h2>
              <p>Vuoden 2025 kansantalouden tilinpito on vielä ennakkotietoa. Väestöpresetit on johdettu vuoden 2025 11rd-taulukosta, ja kaikki appin data luetaan generoidusta baseline-snapshotista.</p>
            </div>
          </div>
          <div className="metrics-grid">
            {baselineMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
          </div>
          <article className="panel identity-panel">
            <span className="eyebrow">Kirjanpidollinen tarkistus</span>
            <h3>151,221 − 161,966 = −10,745 mrd €</h3>
            <p>Julkisyhteisöjen tulot miinus menot täsmäävät baselineen tallennettuun B9-rahoitusasemaan.</p>
          </article>
        </main>
      )}

      {activeTab === 'sources' && (
        <main className="sources-view">
          <div className="section-heading wide-heading">
            <div>
              <span className="eyebrow">Lähderekisteri</span>
              <h2>Mistä data tulee?</h2>
              <p>Appi käyttää versionoitua paikallista snapshotia. `npm run data:update` hakee StatFin-populaatiodatan, validoi sen ja rakentaa uuden baseline-JSONin; selain ei hae viranomaisrajapintaa sliderin liikkeellä.</p>
            </div>
          </div>
          <div className="source-cards">
            {sources.map((source) => (
              <article className="source-card" key={source.id}>
                <div>
                  <span className="eyebrow">{source.organisation}</span>
                  <h3>{source.title}</h3>
                  <p>{source.note}</p>
                </div>
                <div className="source-card-footer">
                  <span>Päivitetty {source.updatedAt}</span>
                  <a href={source.url} target="_blank" rel="noreferrer">Avaa lähde ↗</a>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      <footer>
        <strong>Periaate:</strong> malli kertoo mitä oletuksista seuraa — ei mitä politiikkaa pitäisi kannattaa.
      </footer>
    </div>
  )
}
