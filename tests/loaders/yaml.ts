import fs from 'fs'
import path from 'path'

import dedent from 'dedent'
import yaml from 'js-yaml'

interface OneLinerTestCase {
  case: string
  code: string
  error: string | undefined
  errorStart: string | undefined
  skip: boolean
}

export function loadYamlCases(...pathParts: string[]): OneLinerTestCase[] {
  const cases = yaml.load(fs.readFileSync(
    path.resolve(...pathParts),
    'utf-8',
  )) as OneLinerTestCase[]

  return cases.map((caseDef: OneLinerTestCase): OneLinerTestCase => {
    return {
      ...caseDef,
      'code': dedent(caseDef.code),
      'error': caseDef.error !== undefined ? dedent(caseDef.error) : undefined,
      'errorStart': caseDef.errorStart !== undefined ?
        dedent(caseDef.errorStart) : undefined,
    }
  })
}
