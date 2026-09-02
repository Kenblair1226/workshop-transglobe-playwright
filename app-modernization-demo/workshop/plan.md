# Modernization Plan — Insurance Policy REST API

Bounded, incremental plan that takes the baseline checkpoint to the modernized checkpoint
**without changing `pom.xml`**. Every step below keeps `mvn test` green.

## Constraints (agreed up front)

- No new Maven dependencies. `spring-boot-starter-validation` and
  `spring-boot-configuration-processor` are already present (but unused) in the baseline
  `pom.xml`, specifically so this plan can activate them without a dependency change.
- No database, no cloud services, no new external systems.
- No breaking of existing baseline test *intent* — behavior (premium formulas, HTTP status
  codes for success cases) is preserved; only the response/error *shape* and internal
  wiring change.
- This is a **local, bounded demo migration**, not a claim that a production system has
  been fully migrated. It is meant to exercise the workshop mechanics (assess → plan →
  apply → verify → roll back) on a small, realistic surface.

## Steps

1. **Externalize pricing configuration**
   - Add `PricingProperties` (`@ConfigurationProperties(prefix = "policy.pricing")`)
     binding `baseRates`, `seniorAgeThreshold`, `seniorSurchargeRate`, `minimumPremium`.
   - Add the corresponding `policy.pricing.*` keys to `application.properties`.
   - *Validation*: unit test constructs `PricingProperties` directly and asserts the same
     premium math as the baseline's hard-coded constants.

2. **Switch to constructor injection**
   - `PolicyService(PolicyRepository, PricingProperties)` and
     `PolicyController(PolicyService)` replace `@Autowired` fields.
   - *Validation*: this alone should make the baseline's reflection-based test setup
     unnecessary — modernized `PolicyServiceTest` calls `new PolicyService(repo, props)`
     directly.

3. **Introduce typed response/error DTOs**
   - `PolicyResponse` (record) replaces `Map<String, Object>` as the success payload.
   - `ApiError` (record: `timestamp/status/error/message/path/details`) replaces ad-hoc
     `Map.of("error", ...)` bodies.
   - `PolicyService` now returns the internal `Policy` domain object; the controller maps
     it to `PolicyResponse` via `PolicyResponse.from(policy)`.

4. **Activate Bean Validation**
   - Add `@NotBlank` / `@NotNull` / `@Min` / `@Max` / `@Positive` to `PolicyRequest`
     (already possible because `spring-boot-starter-validation` was already a baseline
     dependency).
   - Controller method adds `@Valid` on `@RequestBody PolicyRequest`.
   - This replaces the baseline's repeated manual `if (...) { return badRequest }` blocks.

5. **Centralize exception handling**
   - Add `PolicyNotFoundException` and `UnsupportedPolicyTypeException` (typed,
     intention-revealing exceptions) thrown by `PolicyService` instead of returning `null`
     or throwing a generic `IllegalArgumentException`.
   - Add `GlobalExceptionHandler` (`@RestControllerAdvice`) that maps:
     - `MethodArgumentNotValidException` → `400` + field-level `ApiError.details`.
     - `PolicyNotFoundException` → `404`.
     - `UnsupportedPolicyTypeException` → `400`.
     - Any other `Exception` → `500` with a generic message (no stack trace leak).
   - Controller methods no longer contain `try/catch` or manual status-mapping.

6. **Verify and snapshot**
   - `mvn test` green on the fully modernized tree.
   - Copy the changed/new files into `workshop/checkpoints/modernized/`.
   - Confirm `scripts/reset-baseline.sh` restores byte-for-byte the original baseline
     tree and `mvn test` is green again (regression safety net for the workshop itself).

## Explicitly out of scope

- Converting `policyType` from `String` to a Java `enum` (kept configurable via
  `PricingProperties` — see open question in `assessment.md`).
- Persistence layer changes (still in-memory `ConcurrentHashMap`).
- API versioning, authentication/authorization, rate limiting, observability/tracing.
- CI/CD pipeline changes — this repo only documents/scripts a local, manual checkpoint
  workflow, it does not stand up a pipeline.

## Human gates before promoting beyond this demo

- Confirm the four open questions in `workshop/assessment.md` with the relevant owners
  (actuarial/business config owner, API consumers, API governance, compliance).
- Have a second engineer review `GlobalExceptionHandler`'s `Exception.class` catch-all —
  intentionally generic here, but a real rollout should decide what (if anything) gets
  logged/alerted on for unexpected errors.
- Decide, as a team, whether `application.properties` is the final home for pricing data
  or a placeholder for a future config service — this plan only externalizes it to Spring
  configuration, it does not implement dynamic/live reload.
