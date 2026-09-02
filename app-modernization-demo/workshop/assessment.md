# Baseline Assessment — Insurance Policy REST API

This assessment covers the **baseline** checkpoint only (the code present in `src/` before
`scripts/apply-modernized.sh` is run, or after `scripts/reset-baseline.sh` restores it).

## Scope of the app

A single REST resource (`/api/policies`) that quotes and stores an insurance policy
in-memory (`PolicyRepository`, backed by a `ConcurrentHashMap`). No database, no external
services, no cloud SDKs. Build: Maven 3.6.3-compatible, Java 17, Spring Boot 3.2.4.

## Baseline build/test status

`mvn test` → **BUILD SUCCESS**, 11 tests, 0 failures, 0 errors (see
`workshop/checkpoints/README.md` for the exact command/output captured during this exercise).
The baseline is realistic-but-working: it is meant to demonstrate patterns a modernization
engagement would actually encounter, not a deliberately broken toy.

## Legacy-but-building patterns identified

| # | File | Pattern | Why it matters |
|---|------|---------|-----------------|
| 1 | `PolicyController`, `PolicyService` | **Field injection** (`@Autowired` on fields, no constructor) | Hides required dependencies, makes classes mutable/harder to construct outside Spring, and forces unit tests to use reflection to inject collaborators (see the reflection hack in the baseline `PolicyServiceTest.setRepository`). |
| 2 | `PolicyService` | **Hard-coded business configuration** (`BASE_RATES`, `SENIOR_AGE_THRESHOLD`, `SENIOR_SURCHARGE_RATE`, `MINIMUM_PREMIUM` as `static final` constants) | Any pricing change requires a code change + full redeploy; can't be tuned per environment (dev/staging/prod) or by non-engineers. |
| 3 | `PolicyController`, `PolicyService` | **Map/stringly-typed responses** (`ResponseEntity<Map<String, Object>>`) | No compile-time contract for API consumers; typos in map keys fail silently at runtime; the service also mixes presentation concerns (building the response map) into business logic. |
| 4 | `PolicyController` | **Manual validation** (repeated `if (... == null || ...) { return badRequest }` blocks) | Verbose, easy to forget a field, inconsistent error message shape across endpoints, and cannot be reused by other controllers. |
| 5 | `PolicyController` | **Weak/duplicated error handling** (per-endpoint `try/catch` around a generic `IllegalArgumentException`, hand-built error maps, `getPolicy` returning `null` to signal "not found") | Inconsistent error payload shape; using `null` instead of an explicit exception loses the reason a lookup failed; the generic `IllegalArgumentException` gives no error code/category for API clients to branch on. |

## Risk / impact if left unaddressed

- **Config drift risk**: pricing constants are only discoverable by reading Java source;
  a business analyst cannot audit or change them without a developer + deploy.
- **Testability cost**: field injection required a reflection workaround in the baseline
  unit test — a maintenance and CI-fragility risk as the object graph grows.
- **API contract risk**: `Map<String, Object>` bodies mean no schema is enforced; a typo
  in a key name would silently produce `null` client-side instead of a compile error.
- **Inconsistent error UX**: the map-based ad-hoc validation is not centrally
  discoverable, so a new endpoint added later is likely to repeat the same pattern
  (or worse, invent a fourth error shape).

## Explicitly out of scope for this modernization (see `plan.md`)

- No database/persistence migration (still in-memory by design for this demo).
- No security/authN-authZ hardening.
- No live/production migration — **this is a bounded, local, in-repo demonstration**,
  not a claim of a completed full application migration.
- No new runtime dependencies — the modernized checkpoint must build with the exact
  same `pom.xml` as the baseline.

## Open questions / human gates

1. **Pricing source of truth** — in a real engagement, would `policy.pricing.*` values
   live in `application.yml`, a config server, or a database table owned by Actuarial?
   *(Human gate: confirm with the business/actuarial owner before treating
   `application.properties` as the final source of truth.)*
2. **Backward compatibility** — is any existing client already parsing the baseline's
   `Map<String, Object>` JSON shape? Switching to a typed DTO changes field ordering and
   omits unknown-key tolerance. *(Human gate: confirm no external consumers depend on the
   baseline response shape before shipping the modernized DTO.)*
3. **Error contract** — the modernized `ApiError` shape (`timestamp/status/error/message/
   path/details`) is a reasonable default but should be aligned with any existing
   org-wide API error standard. *(Human gate: confirm with API governance/style guide
   owners.)*
4. **Policy type validation** — the modernized service still validates `policyType`
   against `PricingProperties` at runtime (not a Java `enum`) so business users can add
   policy types via config. *(Human gate: confirm whether a fixed `enum` is preferred by
   compliance for country/regulatory reasons.)*
