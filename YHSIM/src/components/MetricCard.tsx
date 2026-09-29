import type { BaselineMetric } from '../types'

const formatValue = (metric: BaselineMetric) => {
  if (metric.unit === 'people') return metric.value.toLocaleString('fi-FI')
  const billions = metric.value / 1000
  return `${billions.toLocaleString('fi-FI', { maximumFractionDigits: 1 })} mrd €`
}

export function MetricCard({ metric }: { metric: BaselineMetric }) {
  return (
    <article className="metric-card">
      <div className="metric-topline">
        <span className="eyebrow">{metric.period}</span>
        <span className={`status ${metric.status === 'virallinen' ? 'status-good' : ''}`}>{metric.status}</span>
      </div>
      <strong className="metric-value">{formatValue(metric)}</strong>
      <span className="metric-label">{metric.label}</span>
      <span className="metric-definition">{metric.definition}</span>
    </article>
  )
}
