# mediCalm Output Contract v1.0

## Document Type
Development workflow governance

## Project
mediCalm

## Purpose
This contract defines how governance docs, milestone contracts, implementation prompts, reports, and correction artifacts should be saved and returned during mediCalm development work.

Its purpose is to make development artifacts:

- copy-paste safe
- inspectable
- mobile-resilient
- non-truncated
- path-explicit
- easy to continue from later

## Core Pattern

> save -> print -> continue

---

## 1. Applicability

This contract applies to:

- milestone contracts
- implementation prompts
- evaluation prompts
- patch reports
- governance docs
- correction artifacts
- architecture state summaries

It does not govern:
- product runtime behavior
- app UI content
- user-facing breathing guidance

---

## 2. Save Rule

Any major artifact created for mediCalm development should be saved with:

- a clear file name
- an explicit role
- a stable location
- enough naming discipline to remain understandable later

Avoid vague names like:
- final.md
- final2.md
- fix-latest.md

Use names that reflect function and milestone.

---

## 3. Print Rule

After saving an artifact intended for direct use, return it in chat in a copy-pasteable markdown block when practical.

Priority order:
1. primary artifact
2. associated report or patch summary
3. structured return block with file paths and next step

If space is constrained, print the primary artifact first.

---

## 4. Non-Truncation Rule

Do not replace the main artifact with a summary if the artifact itself is what the user needs to use.

If a summary is needed, place it after the artifact.

Primary development artifacts should remain directly recoverable from chat when practical.

---

## 5. Return Structure Rule

When returning generated mediCalm artifacts, include:

- primary path
- secondary path(s), if any
- one to three sentence summary
- recommended next artifact or next execution step

This keeps long development sessions recoverable.

---

## 6. Copy-Paste Safety Rule

When printing long artifacts:
- use fenced markdown blocks
- preserve formatting
- do not paraphrase inside the artifact body
- do not mix explanation into the artifact itself

The printed artifact should match the saved artifact.

---

## 7. Organization Rule

Artifacts should be saved in a way that reflects actual project structure.

Recommended categories:
- governance
- milestone contracts
- implementation prompts
- evaluation prompts
- reports
- architecture state

Do not scatter governing documents randomly across the repo.

---

## 8. Correction Rule

If a contract or prompt is superseded:
- preserve the authoritative replacement clearly
- mark older artifacts as superseded if needed
- avoid duplicate active-looking files without distinction

The goal is legibility, not just retention.

---

## 9. Workflow Continuity Rule

A mediCalm development session should remain resumable by reading:
- the latest architecture state
- the current authoritative contract
- the latest implementation or evaluation artifact

If a workflow cannot be resumed from saved artifacts, the output discipline has failed.

---

## 10. Failure Conditions

This contract has failed if:

- key artifacts are saved but not recoverable
- the current authoritative file is unclear
- important outputs are truncated into unusable summaries
- naming drift makes artifact purpose ambiguous
- duplicate documents accumulate without authority clarity

---

## 11. Final Rule

mediCalm artifact generation must remain:

- save-first
- copy-safe
- path-explicit
- recoverable
- non-chaotic
- continuation-friendly