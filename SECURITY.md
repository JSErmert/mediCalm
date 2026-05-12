# Security Policy

## Supported Versions

mediCalm is research / portfolio software under active development. Only the `main` branch is considered current.

| Branch | Supported |
| ------ | --------- |
| `main` | Yes       |
| Others | No        |

## Reporting a Vulnerability

If you discover a security issue in mediCalm — whether in the React PWA, the state-regulation logic, or build / deployment configuration — please report it privately rather than opening a public issue.

**Contact:** [jseermert@gmail.com](mailto:jseermert@gmail.com)

Please include:

- A clear description of the issue
- Steps to reproduce
- The affected file path(s)
- Any proof-of-concept code or output (if applicable)

I aim to acknowledge within 5 business days. Coordinated disclosure is appreciated — please give me a reasonable window to investigate and patch before any public discussion.

## Scope

In scope:
- The React PWA under `src/`
- State-regulation and safety-gate logic
- Build configuration and tooling
- Repository configuration and CI

Out of scope:
- Vulnerabilities in third-party dependencies (please report upstream)
- Crisis-resource / 988 escalation paths that intentionally redirect to external services
