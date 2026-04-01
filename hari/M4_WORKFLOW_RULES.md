# M4 Workflow Rules

## Active Files
Claude must use these files in the current M4 workflow:
- M4 ground truth file
- current M4 clarifications/version file
- M4 master behavior test matrix
- current implementation plan file

## Trigger Commands

### Implementation
If the user gives a current M4 update prompt, continue implementation normally.

### Testing
If the user writes:

`test [update]`

Examples:
- `test 4.6`
- `test 4.6.1`
- `test 4.7`

Claude must switch into verification mode.

In verification mode, Claude must:
- read the active M4 workflow files
- inspect the relevant implementation
- map the requested update to the appropriate behavior matrix sections
- return only test-focused findings

## Verification Mode Output
Return only:
- Tested Scope
- Pass
- Fail
- Missing
- Regression Risks
- Required Fixes

Do not redesign the architecture during test mode.
Do not expand scope unless a regression or blocker requires it.