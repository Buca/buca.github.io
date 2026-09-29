import { sourceById } from '../data/baseline'

export function SourceList({ sourceIds }: { sourceIds: string[] }) {
  const unique = [...new Set(sourceIds)]
  if (!unique.length) return <span className="muted">Ei ulkoista lähdettä tälle johdetulle riville.</span>
  return (
    <ul className="source-list">
      {unique.map((id) => {
        const source = sourceById[id]
        if (!source) return null
        return (
          <li key={id}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.organisation}: {source.title}</a>
            <span>Päivitetty {source.updatedAt}. {source.note}</span>
          </li>
        )
      })}
    </ul>
  )
}
