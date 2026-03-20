# Security Audit Workflow

## Trigger

`autoresearch:security` or keywords: "security audit", "threat model", "OWASP", "STRIDE", "red-team"

## Setup Phase (Once)

1. **Codebase recon** — scan tech stack, dependencies, configs, API routes
2. **Asset identification** — data stores, auth systems, external services, user inputs
3. **Trust boundary mapping** — browser/server, public/authenticated, user/admin, CI/prod
4. **STRIDE threat model** — Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation
5. **Attack surface map** — entry points, data flows, abuse paths
6. **Baseline tool runs** — `bun audit`, dependency checks

## Autonomous Loop

Each iteration:

1. Select untested attack vector from the map
2. Analyze relevant code for the vector
3. Validate findings with file:line evidence
4. Classify: severity (critical/high/medium/low/info), OWASP category, STRIDE tag
5. Log to TSV; print coverage summary every 5 iterations

## Composite Metric

`(owasp_tested/10)*50 + (stride_tested/6)*30 + min(findings, 20)` — higher is better

## Red-Team Personas

- **Security Adversary** — external attacker exploiting public interfaces
- **Supply Chain Attacker** — compromised dependency or build pipeline
- **Insider Threat** — authenticated user escalating privileges
- **Infrastructure Attacker** — targeting deployment, secrets, configs

## Output Structure

```
security/<YYMMDD>-<HHMM>-<slug>/
  overview.md
  threat-model.md
  attack-surface-map.md
  findings.md
  owasp-coverage.md
  dependency-audit.md
  recommendations.md
  security-audit-results.tsv
```

## Flags

- `--diff` — only audit files changed since last audit
- `--fix` — auto-remediate Critical/High findings after audit
- `--fail-on <severity>` — exit non-zero for CI/CD gating
