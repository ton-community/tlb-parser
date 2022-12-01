// Only used for tests now, CLI will be awailable later
// TODO: build normal CLI

import fs from 'fs'
import util from 'util'

import { ast } from './index'

const input = fs.readFileSync(
  process.argv[2] as string,
  'utf-8',
)

console.log(
  util.inspect(
    ast(input),
    { showHidden: false, depth: null, colors: true },
  ),
)
