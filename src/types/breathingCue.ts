import type { LocationTag } from './taxonomy'
import type { RegulatoryGoal, LocationPattern } from './hari'

export type CuePhase = 'setup' | 'in_session'

export type BreathingCue = {
  id: string
  text: string // app-voice coaching — never attributed to a paper (INV-2)
  phase: CuePhase
  core?: boolean
  condition?: {
    locationIncludes?: LocationTag[]
    goalIncludes?: RegulatoryGoal[]
    locationPatternIncludes?: LocationPattern[]
  }
  grounding?: { pmid: string; record_id?: string }
}

export type CueSessionInput = {
  location?: LocationTag[]
  locationPattern?: LocationPattern
  goal?: RegulatoryGoal | null
}

export type SessionCues = { setupCues: BreathingCue[]; inSessionCues: BreathingCue[] }
