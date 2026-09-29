import { setTimeout as sleep } from 'node:timers/promises'

export const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()

export function findVariable(metadata, { codes = [], texts = [] }) {
  if (!metadata || !Array.isArray(metadata.variables)) {
    throw new Error('PxWeb metadata does not contain a variables array.')
  }

  const codeSet = new Set(codes.map(normalize))
  const textSet = new Set(texts.map(normalize))

  const found = metadata.variables.find((variable) => {
    const code = normalize(variable.code)
    const text = normalize(variable.text)
    return codeSet.has(code) || textSet.has(text)
  })

  if (!found) {
    const available = metadata.variables.map((variable) => `${variable.code}: ${variable.text}`).join(', ')
    throw new Error(`Could not resolve PxWeb variable. Available variables: ${available}`)
  }

  return found
}

export function findValueCode(variable, wantedLabel, fallbackCodes = []) {
  const wanted = normalize(wantedLabel)
  const labels = Array.isArray(variable.valueTexts) ? variable.valueTexts : []
  const values = Array.isArray(variable.values) ? variable.values : []

  const labelIndex = labels.findIndex((label) => normalize(label) === wanted)
  if (labelIndex >= 0 && values[labelIndex] !== undefined) return values[labelIndex]

  for (const fallback of fallbackCodes) {
    const idx = values.findIndex((value) => normalize(value) === normalize(fallback))
    if (idx >= 0) return values[idx]
  }

  throw new Error(`Could not resolve value "${wantedLabel}" for variable ${variable.code} (${variable.text}).`)
}

export function findAgeCodes(ageVariable, minAge, maxAge) {
  const codes = []
  for (let age = minAge; age <= maxAge; age += 1) {
    codes.push(findValueCode(ageVariable, String(age), [String(age).padStart(3, '0')]))
  }
  return codes
}

export function numericValues(jsonStat2) {
  const raw = jsonStat2?.value
  if (Array.isArray(raw)) {
    return raw.map((value) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Expected numeric JSON-stat2 value, got ${String(value)}.`)
      }
      return value
    })
  }

  if (raw && typeof raw === 'object') {
    return Object.keys(raw)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => {
        const value = raw[key]
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new Error(`Expected numeric JSON-stat2 value at ${key}, got ${String(value)}.`)
        }
        return value
      })
  }

  throw new Error('JSON-stat2 response does not contain numeric values.')
}

export async function fetchJson(url, init = {}, options = {}) {
  const retries = options.retries ?? 3
  const timeoutMs = options.timeoutMs ?? 30_000

  let lastError
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'yhteiskuntasimulaattori-data-ingest/0.2',
          ...(init.headers ?? {}),
        },
      })

      if (response.ok) return await response.json()

      const body = await response.text()
      const retryable = response.status === 429 || response.status === 503
      if (!retryable || attempt === retries - 1) {
        throw new Error(`PxWeb request failed ${response.status}: ${body.slice(0, 500)}`)
      }
    } catch (error) {
      lastError = error
      if (attempt === retries - 1) throw error
    } finally {
      clearTimeout(timeout)
    }
    await sleep(500 * (attempt + 1))
  }

  throw lastError ?? new Error('PxWeb request failed.')
}

export function buildQuery(metadata, selections) {
  return {
    query: metadata.variables.map((variable) => {
      const selected = selections.get(variable.code)
      if (!selected?.length) {
        if (Array.isArray(variable.values) && variable.values.length === 1) {
          return { code: variable.code, selection: { filter: 'item', values: [variable.values[0]] } }
        }
        throw new Error(`No selection provided for PxWeb variable ${variable.code} (${variable.text}).`)
      }
      return { code: variable.code, selection: { filter: 'item', values: selected } }
    }),
    response: { format: 'json-stat2' },
  }
}
