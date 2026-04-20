# mediCalm Pre-Staging Review — 2026-04-20

## Document Type
Repo organization audit — pre-staging review

## Project
mediCalm

## Status
Generated for Gate 5 staging discipline. Records every pending working-tree change, hygiene stragglers, and approved commit grouping prior to any `git add` or `git commit`.

## Authority applied
- `mediCalm_Governance_Index_v1.0.md` §3 (AlignFlow → AROD → AMO → Output Contract) and §11 (repo-audit sequence)
- `mediCalm_AlignFlow_Governance_v1.0.md` §4 (readiness thresholds), §6 (prematurity test)
- `mediCalm_AROD_Governance_v1.0.md` §2 (truth-status), §4 (contradiction detection)
- `mediCalm_Output_Contract_v1.0.md` §5 (return structure), §7 (organization rule), §8 (correction rule), §10 (failure conditions)

## Baseline
- Branch: `m5-6-architecture-pass`
- Ahead of `origin/main`: 13 commits at time of review
- `git status --porcelain` count: 97 entries (92 deletions, 1 modification, 4 untracked directories)
- Nothing staged

---

## 1. Pending changes by category

### Cat-A — Governance pack addition (drives the whole audit)
- **New (untracked):** `docs/orchestration/governance/` (4 files) + `docs/orchestration/workflow/` (1 file) + this review artifact at `docs/orchestration/reports/`
  - `mediCalm_AlignFlow_Governance_v1.0.md`
  - `mediCalm_AROD_Governance_v1.0.md`
  - `mediCalm_AMO_Governance_v1.0.md`
  - `mediCalm_Governance_Index_v1.0.md`
  - `mediCalm_Output_Contract_v1.0.md`
  - `mediCalm_Pre_Staging_Review_2026-04-20.md` (this file)
- **Size:** additions only, no deletions
- **Logic:** pure addition of new authority layer + its first applied artifact

### Cat-B — Context pack relocation + authority-map repair + Gate 3 rename
- **Deletions (from HEAD):** 21 files at root: `00_…` through `19_…` plus `18_…_ARCHIVED.md`
- **Additions:** 21 files at `docs/context/`
- **Nested Gate 2 edits:** `docs/context/00_mediCalm_document_hierarchy_map.md` had its Recommended File Order renumbered α-style (preserving reading-order intent while aligning filenames with actual files); Authority-by-Domain tables corrected (9 filename updates); archived `18_…` removed from active-authority list; typo `_-motion_` fixed
- **Nested Gate 3 rename:** `19_mediCalm_mechanism_protocol_mapping.md.md` → `19_mechanism_protocol_mapping_reference_ARCHIVED.md`
- **Rename-detection expectation:** 19 clean renames; `00_…` will show as rename-with-modification; `19_…_ARCHIVED.md` rename-with-filename-change may fall back to delete+add depending on similarity threshold

### Cat-C — HARI reference pack relocation
- **Deletions:** 6 files in root `hari/`
- **Additions:** 6 files in `docs/hari/`
- **Rename-detection expectation:** all 6 clean renames (content unchanged)

### Cat-D — Milestone contracts relocation + Gate 1/3 duplicate resolution
- **Deletions:** 65 files under `Updates/` (Milestone 3/4/5/6/7/7-10 Architecture + `Current_M6-M10_State.md`)
- **Additions:** equivalent tree under `docs/milestones/`
- **Nested rename/delete actions (Gate 3):**
  - M6.3 `Domain_Boundary_Instructions.md` → `Dynamic_Intake_Domain_Instructions.md`
  - M6.4 `Domain_Boundary_Instructions.md` → `HARI_Interpretation_Domain_Instructions.md`
  - M6.8.3.2 / M6.8.4 content-swap fix: deleted misnamed duplicate; renamed `"- Copy"` file into correct slot
  - M4.7.1 pair: `(M4.1.1)` → `SUPERSEDED`; `(Final)` parenthetical dropped from canonical
  - M4.9 pair: `- Copy` → `SUPERSEDED`; `(Final)` parenthetical dropped from canonical
  - M4.7 `- Copy` suffix dropped
- **Rename-detection expectation:** most clean; renamed-plus-moved files may drop to delete+add
- **Net file count:** -1 (one delete of the misnamed M6.8.4 duplicate)

### Cat-E — `CLAUDE.md` authority-chain path repair
- **Modification:** 1 line of `CLAUDE.md` at repo root
- Points hierarchy-map reference to `docs/context/00_mediCalm_document_hierarchy_map.md`
- **Dependency:** only valid once Cat-B is in place

### Cat-F — M6GuidedSessionScreen retirement (Gate 4)
- **Deletions (tracked):** `src/screens/M6GuidedSessionScreen.tsx`, `src/screens/M6GuidedSessionScreen.module.css`
- Per M6.8.4 contract; zero remaining references verified

---

## 2. Hygiene stragglers (flagged, not actioned)

Truth-status per AROD §2. These do not block the commit plan.

| # | Item | Reason flagged |
|---|---|---|
| 1 | `docs/hari/M4.0–4.5_v1.1_CLARIFICATIONS.md.md` | double `.md.md` + unicode em-dash (Windows-fragile) |
| 2 | `docs/milestones/Milestone 4/M4 UPDATE PASSES/M4.0–4.5_v1.1_CLARIFICATIONS.md.md` | same double-`.md.md` + em-dash |
| 3 | `docs/milestones/Milestone 4/M4 IMPORTANT CONTEXT/HARI_IMPLEMENTATION_PLAN_v2.md.md` | double `.md.md` |
| 4 | `M2_BREATHING_ORB_IMPLEMENTATION_CONTRACT.md.md` (root) | at root, unmigrated, double `.md.md` |
| 5 | `M2_SESSION_EXPERIENCE_SPEC.md` (root) | at root, unmigrated (no `docs/milestones/Milestone 2/` exists) |
| 6 | `personal_patient_history_reference.md` (root) | sensitive-sounding filename, uncategorized at root |
| 7 | `src/screens/SessionPlaceholder.module.css` | orphan CSS from M2 refactor; zero references |
| 8 | Multi-space/special-char directory names (`M4 UPDATE PASSES`, `ux ui design`, `Milestone 7-10 Architecture`, etc.) | CLI/tooling friction; not invalid |
| 9 | Auto-memory claims M6 fully implemented and PainInputScreen deprecated; `App.tsx` contradicts both | memory drift vs code; update once M7 work begins |

---

## 3. Approved commit grouping

Approved commit order: **A → B → E → D → C → F** (6 commits).

Cat-D kept as a single commit unless rename detection becomes materially bad.

| # | Category | Commit message |
|---|---|---|
| 1 | Cat-A | `docs(governance): add orchestration governance pack v1.0` |
| 2 | Cat-B | `docs(context): relocate doctrine pack to docs/context/; repair authority-map references; archive 19_ reference input` |
| 3 | Cat-E | `chore(claude-md): repoint authority chain to docs/context/00_document_hierarchy_map` |
| 4 | Cat-D | `docs(milestones): relocate Updates/ to docs/milestones/; resolve M6.3/M6.4 naming, M6.8.3.2/M6.8.4 content swap, M4.7.1 and M4.9 SUPERSEDED markers, drop (Final)/- Copy` |
| 5 | Cat-C | `docs(hari): relocate HARI behavior pack from hari/ to docs/hari/` |
| 6 | Cat-F | `chore(src): retire orphan M6GuidedSessionScreen per M6.8.4 runtime-unification contract` |

### Per-commit validity
- Commit 1 leaves governance pack visible at new path; no dependencies.
- Commit 2 lands Cat-B; the docs/context/ tree becomes present for Cat-E to point at.
- Commit 3 repairs CLAUDE.md pointer — only after Cat-B is in place.
- Commit 4 lands the largest single group (milestone relocation + duplicate resolution).
- Commit 5 lands HARI pack relocation (independent of all prior commits).
- Commit 6 removes tracked orphan src files per M6.8.4 contract.

### Rename-detection plan
- Pause after each commit; report `git status` and `git show --stat --summary HEAD`.
- Watch commits 2 and 4 especially — these carry rename+modify or rename+move combinations where git may fall back to delete+add.
- If a file with meaningful history falls to delete+add in an avoidable way, flag before proceeding.

---

## 4. Branch state after pass

- Branch: `m5-6-architecture-pass`
- Projected commits ahead of `origin/main` after Gate 5: **19**
- No merge to `main` planned; branch stays as-is per prior user directive.

---

## 5. Resumption notes

If this session pauses and later resumes, a future reader should:
1. Read the 5 governance docs under `docs/orchestration/` first.
2. Read this file to understand the staging plan and what was already resolved across Gates 1-4.
3. Check `git status` to compare with "Baseline" at top of this file — 97 porcelain entries means Gate 5 has not begun; fewer means commits are in progress; zero means Gate 5 complete.
4. Check `git log --oneline origin/main..HEAD` — 13 commits means Gate 5 has not begun; 19 commits means Gate 5 complete.

## 6. Open items queued for a later hygiene gate

- 9 stragglers listed in §2
- Memory/code drift update once M7 work begins
- Branch merge strategy (PR to `main` or continue on feature branch) — user directive deferred

---

Authority alignment: this review follows Output Contract §5 (return structure), §7 (categorized organization), §9 (workflow continuity). It is path-explicit, non-truncated, and resumable.
