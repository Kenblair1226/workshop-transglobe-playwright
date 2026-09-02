# App Modernization Demo — Insurance Policy REST API

A small, self-contained Spring Boot service used for a Java app-modernization workshop.
It has **no database and no cloud dependency** — everything is stored in memory — so it
builds and runs anywhere with just a JDK and Maven.

- Java 17, Maven 3.6.3-compatible, Spring Boot 3.2.4 (real GA release from Maven Central).
- All builds are UTF-8 (`project.build.sourceEncoding`, `project.reporting.outputEncoding`,
  `maven.compiler.release` + explicit compiler/surefire encoding).
- Two checkpoints of the same app: a **baseline** (intentionally legacy-but-building) and
  a **modernized** version reachable without any `pom.xml` change. See
  `workshop/checkpoints/README.md` for exactly what changes and why.

## Build & run

```bash
mvn test        # compiles + runs unit/web-layer tests
mvn spring-boot:run
```

## API

| Method | Path                        | Body                                                                 |
|--------|-----------------------------|-----------------------------------------------------------------------|
| POST   | `/api/policies`              | `{"policyHolderName":"Alice Wu","age":30,"policyType":"LIFE","sumInsured":100000}` |
| GET    | `/api/policies/{policyNumber}` | —                                                                     |

Premium = `sumInsured * baseRate(policyType)`, +15% surcharge if age ≥ 60, floored at a
configured minimum premium.

## Switching checkpoints

```bash
./scripts/apply-modernized.sh   # copy the modernized checkpoint into src/
./scripts/reset-baseline.sh     # restore the original baseline checkpoint into src/
```

Both scripts are idempotent, resolve their own directory, only touch an explicit, named
list of files under `src/`, and never modify `pom.xml`. See `workshop/checkpoints/README.md`.

## Workshop docs

- `workshop/assessment.md` — baseline code assessment (smells found, risk, scope).
- `workshop/plan.md` — bounded modernization plan, sequencing, human gates.
- `workshop/prompts.md` — example prompts used to drive the modernization steps.
- `workshop/checkpoints/README.md` — exact file inventory + how the checkpoint scripts work.
