# Example Prompts — App Modernization Workshop

These are example prompts a workshop facilitator can reuse (with an AI coding assistant,
e.g. GitHub Copilot CLI/Chat) to reproduce each step of `plan.md` against the baseline
checkpoint. They are illustrative, not a script that must be replayed verbatim — the
`workshop/checkpoints/modernized/` files are the actual, already-verified output.

## 1. Assess the baseline

> "Review `src/main/java/com/transglobe/policy` and list every legacy-but-building
> pattern you can find (dependency injection style, hard-coded configuration, response
> typing, validation, error handling). For each, explain the risk if left unaddressed.
> Do not change any code yet — only produce an assessment."

## 2. Propose a bounded plan

> "Given the assessment, propose a modernization plan that: (a) requires zero changes to
> `pom.xml`, (b) keeps `mvn test` green after every step, (c) preserves the existing
> premium calculation and success-path HTTP status codes. List the steps in the order you
> would apply them and how you'd validate each one."

## 3. Externalize configuration

> "Extract the hard-coded rate/threshold constants from `PolicyService` into a
> `@ConfigurationProperties(prefix = "policy.pricing")` class bound from
> `application.properties`. Keep the public behavior of `PolicyService` identical for now
> — don't change dependency injection or response types yet. Add/update tests to prove
> the computed premiums are unchanged."

## 4. Switch to constructor injection

> "Refactor `PolicyService` and `PolicyController` from field injection (`@Autowired` on
> fields) to constructor injection. Update the unit tests to construct the classes
> directly instead of using reflection to set fields."

## 5. Introduce a typed response and activate Bean Validation

> "Replace the `Map<String, Object>` response from `PolicyController`/`PolicyService`
> with a typed `PolicyResponse` DTO (a record is fine). Add Bean Validation annotations
> to `PolicyRequest` using the `spring-boot-starter-validation` dependency that's already
> in the pom, and use `@Valid` on the controller method instead of manual if/return
> checks. Update the tests to assert on typed fields and validation-triggered 400s."

## 6. Centralize exception handling

> "Introduce explicit exception types for 'policy not found' and 'unsupported policy
> type', have `PolicyService` throw them instead of returning `null` or a generic
> `IllegalArgumentException`, and add a `@RestControllerAdvice` that maps them (plus
> Bean Validation failures and any other exception) to a consistent typed error response.
> Remove the now-redundant try/catch blocks from the controller."

## 7. Verify both checkpoints stay green

> "Run `mvn test` on the fully modernized tree, confirm it's green, then run
> `scripts/reset-baseline.sh` and run `mvn test` again to confirm the original baseline
> still builds and passes unmodified. Report the exact commands and pass/fail counts."

## Notes for facilitators

- Keep each prompt's diff small enough to review in a few minutes — this mirrors how the
  actual checkpoint files were produced (see `workshop/checkpoints/README.md`).
- If an assistant proposes adding a new Maven dependency at any step, treat that as a
  signal to stop and re-scope — it violates the "no pom changes" constraint for this demo.
- Use the open questions in `workshop/assessment.md` as natural pause points to bring in a
  human reviewer (business/config owner, API consumer team, compliance) before treating
  any step as "done" beyond this local demo.
