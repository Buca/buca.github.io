import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQuery, findAgeCodes, findValueCode, findVariable, numericValues } from '../lib/pxweb.mjs'

const metadata = {
  variables: [
    { code: 'contentscode', text: 'Information', values: ['vaesto'], valueTexts: ['Population 31 Dec'] },
    { code: 'timeperiod_y', text: 'Year', values: ['2024', '2025'], valueTexts: ['2024', '2025'] },
    { code: 'sex_2_20200101', text: 'Sex', values: ['SSS', '1', '2'], valueTexts: ['Total', 'Males', 'Females'] },
    { code: 'age_2_20200101', text: 'Age', values: ['SSS', '018', '019', '020'], valueTexts: ['Total', '18', '19', '20'] },
  ],
}

test('resolves post-2026 PxWeb variable codes from labels', () => {
  assert.equal(findVariable(metadata, { codes: ['timeperiod_y'], texts: ['Year'] }).code, 'timeperiod_y')
  assert.equal(findVariable(metadata, { texts: ['Sex'] }).code, 'sex_2_20200101')
  assert.equal(findValueCode(findVariable(metadata, { texts: ['Sex'] }), 'Total', ['SSS']), 'SSS')
})

test('resolves one-year age codes by value text', () => {
  const age = findVariable(metadata, { texts: ['Age'] })
  assert.deepEqual(findAgeCodes(age, 18, 20), ['018', '019', '020'])
})

test('buildQuery uses metadata variable codes and covers all dimensions', () => {
  const selections = new Map([
    ['contentscode', ['vaesto']],
    ['timeperiod_y', ['2025']],
    ['sex_2_20200101', ['SSS']],
    ['age_2_20200101', ['018', '019']],
  ])
  const query = buildQuery(metadata, selections)
  assert.equal(query.query.length, 4)
  assert.equal(query.query[2].code, 'sex_2_20200101')
  assert.deepEqual(query.response, { format: 'json-stat2' })
})

test('numericValues handles JSON-stat2 arrays', () => {
  assert.deepEqual(numericValues({ value: [10, 20, 30] }), [10, 20, 30])
})
