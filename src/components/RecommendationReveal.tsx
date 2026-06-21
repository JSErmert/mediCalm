/**
 * RecommendationReveal — Grounded Guidance Layer 1.
 * Shows the research that explains this session's recommendation, keyed on the
 * engine's derived RegulatoryGoal. App-voice "why" line + the shipped GroundedTip
 * (verbatim quote + linked PMID). Renders nothing when no live, goal-bound
 * message matches (INV-5). Pure selection (INV-1); quote is verbatim (INV-2).
 * Authority: docs/apex-bundle/grounded-guidance/04-layer1-recommendation-reveal-spec.md
 */
import type { RegulatoryGoal } from '../types/hari'
import type { GroundedMessage } from '../types/groundedMessage'
import { selectRecommendationEvidence, type SessionInputTags } from '../engine/groundedMessages/selectRecommendationEvidence'
import { GroundedTip } from './GroundedTip'
import styles from './RecommendationReveal.module.css'

// App-authored, plain-language rationale per goal. App voice — never attributed
// to any paper (INV-2). The verbatim research claim lives in GroundedTip.
const WHY_BY_GOAL: Record<RegulatoryGoal, string> = {
  decompress: 'Easing pressure and giving the area room can quiet an irritated system.',
  restore: 'Low-effort, restful breathing helps your system recover.',
  stabilize: 'Steady, balanced breathing helps your system find a stable baseline.',
  downregulate: 'Slower, longer exhales help settle an activated system.',
  expand: 'Gentle expansion through the breath can release held tension.',
  ground: 'Slow, grounding breaths help discharge and settle high energy.',
  activate: 'A gentle lift in the breath can raise low energy without strain.',
}

export function RecommendationReveal({
  goal,
  input,
  bank,
}: {
  goal: RegulatoryGoal | null
  input: SessionInputTags
  bank?: GroundedMessage[]
}) {
  if (!goal) return null
  const message = selectRecommendationEvidence(goal, input, bank)
  if (!message) return null

  return (
    <div className={styles.reveal} aria-label="Why this session">
      <span className={styles.whyLabel}>Why this for you</span>
      <p className={styles.whyText}>{WHY_BY_GOAL[goal]}</p>
      <GroundedTip message={message} />
    </div>
  )
}
