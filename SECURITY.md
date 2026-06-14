# Security Policy

## Reporting
Report suspected vulnerabilities privately via GitHub Security Advisories on this repo. Do not open public issues for security reports.

## Implemented controls
- **Dependency / vulnerability scanning** — Trivy filesystem scan in CI (`.github/workflows/security.yml`), fails on HIGH/CRITICAL.
- **Secret scanning** — gitleaks in CI + a `pre-commit` gitleaks hook (`.pre-commit-config.yaml`) so secrets are caught before they are committed.
- **Automated dependency updates** — Dependabot (weekly) for npm + GitHub Actions.
- **Secret management** — no secrets committed; environment values supplied at runtime via env vars / host config (never in the repo). `.env*` is gitignored.

## Implemented Controls

- **Dependency / vulnerability scanning** — Trivy filesystem scan in CI (`.github/workflows/security.yml`), failing on HIGH/CRITICAL.
- **Secret scanning** — gitleaks in CI plus a `pre-commit` gitleaks hook (`.pre-commit-config.yaml`), so secrets are caught before they are committed.
- **Automated dependency updates** — Dependabot (weekly) for npm and GitHub Actions.
- **Secret management** — no secrets are committed; environment values are supplied at runtime via env vars / host config, never in the repo. `.env*` is gitignored.

## Scope
mediCalm is a clinical decision-support PWA. Clinical content is decision-support only and not a substitute for professional medical judgment.
