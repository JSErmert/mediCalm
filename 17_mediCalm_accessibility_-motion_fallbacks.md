# MediCalm Accessibility and Motion Fallbacks  
  
Status: Draft  
Owner: Josh  
Purpose: Define how MediCalm preserves calm clarity for users with reduced-motion needs, low-vision needs, audio-off preferences, and different device contexts.  
  
## Core Accessibility Principle  
  
MediCalm should remain:  
- calm  
- readable  
- operable  
- low-overload  
- medically clear  
  
The product must not rely on motion, sound, or subtle visual effects as the only way to understand the session.  
  
## Reduced Motion Mode  
  
### Goal  
Preserve pacing and clarity without requiring animated movement.  
  
### Reduced Motion Rules  
- replace orb expansion/contraction with subtle static state changes  
- replace blur-to-clarity with opacity-only transitions  
- shorten or remove decorative fade effects  
- keep countdown pacing intact  
- maintain step emergence timing without relying on strong animation  
  
### Reduced Motion Breathing Anchor  
Instead of a large scaling orb:  
- keep orb size mostly stable  
- change border intensity or inner fill subtly  
- show countdown prominently  
  
## Audio-Off Mode  
  
- all sessions must be fully usable without sound  
- no critical pacing information may depend on ambient audio  
- audio toggle must be easy to find  
- muting should not disrupt the session state  
  
## Haptics Alternative  
  
- haptics must be optional  
- haptics must never be the sole pacing mechanism  
- use only subtle inhale/exhale confirmation if enabled  
- keep haptics off by default in early builds  
  
## Readability and Contrast  
  
- maintain high contrast for primary step text  
- countdown must remain clearly legible against the orb  
- secondary microtext must never be so faint that it becomes unreadable  
- avoid low-contrast glow-on-glow text  
  
## Screen Reader / Semantic Structure  
  
- controls must have semantic labels  
- primary question on intake must be screen-reader accessible  
- countdown region should have meaningful labeling  
- stop / exit controls must be easy to locate  
- history cards should read in a structured order  
  
## Mobile vs Desktop Accessibility  
  
### Mobile  
- keep central hierarchy simple  
- avoid crowded card layouts  
- keep tap targets large enough  
  
### Desktop  
- preserve centered calm layout  
- do not spread core guidance too far apart  
- avoid using extra space for nonessential panels  
  
## Safety State Accessibility  
  
- safety-stop copy must become visually and semantically dominant  
- do not hide important safety text behind soft or decorative styling  
- history entries for interrupted or worse outcomes must remain explicit  
  
## Motion Safety Rule  
  
If an animation or visual effect risks:  
- dizziness  
- confusion  
- overload  
- delayed understanding  
  
reduce or remove it.  
  
Clarity outranks aesthetic continuity.  
  
## Claude Code Implementation Notes  
  
- Build reduced-motion behavior as a first-class mode.  
- Keep the countdown readable in all accessibility modes.  
- Ensure safety copy is always clearer than ambient styling.  
- Test iPhone portrait first, then desktop.  
