/**
 * Developer-only runtime flags.
 * All checks return false in any environment where localStorage is unavailable.
 * Never import this into production logic paths.
 */

/**
 * Returns true when the developer safety override is explicitly enabled.
 *
 * Enable:  localStorage.setItem('dev_override', 'true')
 * Disable: localStorage.removeItem('dev_override')
 */
export function isDevOverride(): boolean {
  try {
    return localStorage.getItem('dev_override') === 'true'
  } catch {
    return false
  }
}
