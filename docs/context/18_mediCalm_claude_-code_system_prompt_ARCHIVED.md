# MediCalm Claude Code System Prompt  
  
Use this prompt as a build-governance file for Claude Code when generating or editing the app.  
  
You are building MediCalm, a medically grounded, calm, low-overload symptom-support app.  
  
## Product Identity  
  
MediCalm is:  
- a bounded symptom-support system  
- a guided session engine  
- a safety-first product  
- a calm medical interface  
  
MediCalm is not:  
- a diagnosis engine  
- a freeform medical chatbot  
- a generic meditation app  
- a luxury wellness experience  
  
## Core Build Rules  
  
1. Follow the document hierarchy map.  
2. Treat source-boundary rules seriously.  
3. Do not invent medical claims not supported by the docs.  
4. When uncertain, prefer the lower-risk implementation.  
5. Use concise, calm, medically grounded copy.  
6. Keep the experience low-overload and readable.  
7. Preserve the countdown-first breathing experience.  
8. Preserve the home/history loop as part of the core product.  
9. Safety always outranks aesthetics, continuity, personalization, and follow-up.  
10. Do not allow the UI to drift into hype, mysticism, or vague wellness language.  
  
## Runtime Rules  
  
- Use deterministic logic in the first build.  
- Do not invent new protocols dynamically.  
- Use the execution spec for scoring, tie-breaks, selection, follow-up gating, and persistence behavior.  
- Use the protocol library as the selectable protocol source.  
- Use the input taxonomy for enums and normalization.  
  
## UI Rules  
  
- Use the guided session UI spec as the primary truth for session presentation.  
- The breathing orb is the primary pacing instrument.  
- The countdown must remain obvious.  
- The user should only need to look, follow, and breathe.  
- Use crossfades and restrained focus-to-clarity transitions, not dramatic motion.  
- Keep mobile portrait as the first priority.  
  
## Safety Rules  
  
- Use the safety/reassurance spec as the authority for interruption behavior, escalation copy, and claims limits.  
- Stop the session immediately when stop conditions are met.  
- Do not soften urgent safety messaging so much that it becomes ambiguous.  
- Do not imply that the app rules out serious conditions.  
  
## Tone Rules  
  
Write like a calm medical support system:  
- clear  
- steady  
- concise  
- respectful  
- non-hyped  
  
Prefer:  
- Start here.  
- Follow this.  
- Good. Continue.  
- Stop here.  
- Notice what changed.  
  
Avoid:  
- guaranteed relief  
- cure language  
- mystical wording  
- motivational hype  
- false reassurance  
  
## Output Discipline  
  
When generating product code:  
- preserve clear file organization  
- use explicit types and enums when possible  
- keep protocol definitions separate from runtime session objects  
- keep history entries compact and reviewable  
- implement reduced-motion and audio-off support  
- ensure safety states are visually and semantically dominant  
  
If there is a conflict between elegance and safety, choose safety.  
If there is a conflict between novelty and clarity, choose clarity.  
If there is a conflict between aesthetics and medical boundaries, choose medical boundaries.  
