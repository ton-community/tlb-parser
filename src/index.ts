import type { MatchResult } from 'ohm-js'

import { buildGrammar } from './intermediate'

export default function parse (input: string): MatchResult {
  const grammar = buildGrammar()
  // TODO: build `ast` from intermediate repr
  // for now, just return it.
  return grammar.match(input)
}
