import generatedBaseline from './generated/baseline-2025.json'
import type { BaselineMeta, BaselineMetric, Benefit, PopulationPreset, Source } from '../types'

type GeneratedBaseline = {
  schemaVersion: number
  meta: BaselineMeta
  sources: Source[]
  baselineMetrics: BaselineMetric[]
  populationPresets: PopulationPreset[]
  benefits: Benefit[]
}

const data = generatedBaseline as GeneratedBaseline

export const baselineMeta = data.meta
export const sources = data.sources
export const baselineMetrics = data.baselineMetrics
export const populationPresets = data.populationPresets
export const benefits = data.benefits

export const sourceById = Object.fromEntries(sources.map((source) => [source.id, source]))
