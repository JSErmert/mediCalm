/**
 * fieldMode — how much the ambient water column is allowed to do on a given screen.
 *
 * The Deep Current field is persistent: it renders once in App and survives every
 * screen transition. That is what makes it read as one body of water rather than a
 * per-page decoration, but it also means a single field has to serve three very
 * different jobs, so it is explicitly damped per screen rather than left alone.
 *
 *   'full'  — the idle field. Motes drift, the two colour pools wander.
 *   'calm'  — a session is running. The user is following a breath; anything else
 *             that moves is competing with it, and a drifting field in peripheral
 *             vision while someone is regulating can pull focus or turn queasy.
 *             Motes drop to a trace and the pools slow down. It is not switched off,
 *             because a background that vanishes when the session starts reads as a
 *             glitch.
 *   'off'   — a safety surface. The 988 route, the SAD gate, the safety stop and the
 *             support-resource exit are the screens where the app is at its most
 *             serious, and they should look exactly as they did before this field
 *             existed. Atmosphere on a crisis screen is the wrong instinct.
 *
 * Two of the three added layers respond to this: the particulate and the colour pools.
 * The original D4-B4 base gradient, guilloché rays and cross-hatch are untouched on
 * every screen and never read it.
 *
 * The depth vignette is the deliberate exception and stays on at every mode, safety
 * surfaces included. It adds no motion, no hue and no light — it only lets the corners
 * fall further into the pressure dark, which seats the existing ground rather than
 * decorating it. A safety screen is therefore NOT pixel-identical to what it was before
 * this field existed: it is the same screen, sitting slightly deeper.
 */
import type { AppScreen } from '../../context/AppContext'

export type FieldMode = 'full' | 'calm' | 'off'

/**
 * Screens where a session is actively running and the breath owns the user's
 * attention.
 */
const SESSION_SCREENS: readonly AppScreen[] = ['guided_session', 'custom_player']

/**
 * Safety surfaces. Listed explicitly rather than derived from a name pattern: a
 * future screen called something else must FAIL to match and be added here on
 * purpose, never be quietly swept in or out by a regex.
 */
const SAFETY_SCREENS: readonly AppScreen[] = [
  'safety_stop',
  'sad_safety',
  'hari_safety_gate',
  'support_resources',
]

export function getFieldMode(screen: AppScreen): FieldMode {
  if (SAFETY_SCREENS.includes(screen)) return 'off'
  if (SESSION_SCREENS.includes(screen)) return 'calm'
  return 'full'
}
