import type { Grammar } from 'ohm-js'
import ohm from 'ohm-js'

import grammar from './grammar/tlb'

export function buildGrammar(): Grammar {
  return ohm.grammar(grammar)
}
