import fs from 'fs'
import path from 'path'

import { ast } from '../../src'
import { Program } from '../../src/ast/nodes'
import { loadYamlCases } from '../loaders/yaml'

const fixturesDir = path.resolve(__dirname, '..', 'fixtures')

describe('ast generation', () => {
  test('block.tlb can be parsed', () => {
    expect.hasAssertions()

    const input = fs.readFileSync(
      path.resolve(fixturesDir, 'tlb', 'block.tlb'),
      'utf-8',
    )
    const tree = ast(input)

    expect(tree).toBeInstanceOf(Program)
  })

  for (
    let caseDef of loadYamlCases(
      fixturesDir,
      'ast',
      'examples.yml',
    )
  ) {
    test(`Generated ast example: ${caseDef.case}`, () => {
      expect.hasAssertions()

      const tree = ast(caseDef.code)

      expect(tree).toBeInstanceOf(Program)
      expect(tree).toMatchSnapshot()
    })
  }
})
