import type { TierACitation, ReviewStatus, ISODate } from './m7'
import type { LocationTag, SymptomTag, TriggerTag } from './taxonomy'
import type { RegulatoryGoal } from './hari'

export type { ReviewStatus } from './m7'

export type MessageSelectors = {
  location?: LocationTag[]
  symptom?: SymptomTag[]
  trigger?: TriggerTag[]
  goal?: RegulatoryGoal[]
}

export type GroundedMessage = {
  message_id: string
  text: string
  selectors: MessageSelectors
  citation: TierACitation
  display_quote: string
  authored_by: string
  authored_at: ISODate
  review_status: ReviewStatus
}
