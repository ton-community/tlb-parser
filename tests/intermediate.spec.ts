import fs from 'fs'
import path from 'path'

import parse from '../src'

const fixturesDir = path.resolve(__dirname, 'fixtures')

describe('parsing', () => {
  test('block.tlb can be parsed', () => {
    expect.hasAssertions()

    const input = fs.readFileSync(
      path.resolve(fixturesDir, 'block.tlb'),
      'utf-8',
    )
    const parsed = parse(input)

    expect(parsed.succeeded()).toBe(true)
  })
})
