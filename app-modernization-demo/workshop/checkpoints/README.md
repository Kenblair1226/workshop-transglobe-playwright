# Checkpoints — Baseline & Modernized

This project is **not a git repository**, so checkpoints are represented as plain file
snapshots (not patches/diffs) under this directory, plus two safe, idempotent scripts in
`../../scripts/` that copy known files between these snapshots and `src/`.

```
workshop/checkpoints/
├── baseline/       # snapshot of the 6 files that differ, in their ORIGINAL (legacy) form
└── modernized/     # snapshot of the same 6 files (modernized form) + 6 new files
```

`pom.xml` is identical for both checkpoints and is never touched by either script.

## File inventory

### Files that exist in both checkpoints (content differs)

| Path (relative to project root) | Baseline | Modernized |
|---|---|---|
| `src/main/java/com/transglobe/policy/dto/PolicyRequest.java` | plain fields, no validation annotations | `@NotBlank`/`@NotNull`/`@Min`/`@Max`/`@Positive` (Bean Validation) |
| `src/main/java/com/transglobe/policy/service/PolicyService.java` | `@Autowired` field injection, hard-coded rate constants, returns `Map<String,Object>` | constructor injection, uses `PricingProperties`, returns domain `Policy`, throws typed exceptions |
| `src/main/java/com/transglobe/policy/web/PolicyController.java` | `@Autowired` field injection, manual if/return validation, `try/catch`, `Map<String,Object>` responses | constructor injection, `@Valid`, typed `PolicyResponse`, no local error handling |
| `src/main/resources/application.properties` | no `policy.pricing.*` keys | adds `policy.pricing.*` keys bound by `PricingProperties` |
| `src/test/java/com/transglobe/policy/service/PolicyServiceTest.java` | asserts on `Map` keys; uses reflection to inject the repository | asserts on typed `Policy` getters; constructs `PolicyService` directly |
| `src/test/java/com/transglobe/policy/web/PolicyControllerTest.java` | asserts on JSON map/error shape | asserts on typed `PolicyResponse`/`ApiError` JSON shape |

### Files that exist ONLY in `modernized/` (new, additive)

| Path (relative to project root) |
|---|
| `src/main/java/com/transglobe/policy/dto/PolicyResponse.java` |
| `src/main/java/com/transglobe/policy/dto/ApiError.java` |
| `src/main/java/com/transglobe/policy/config/PricingProperties.java` |
| `src/main/java/com/transglobe/policy/exception/PolicyNotFoundException.java` |
| `src/main/java/com/transglobe/policy/exception/UnsupportedPolicyTypeException.java` |
| `src/main/java/com/transglobe/policy/exception/GlobalExceptionHandler.java` |

### Files never touched by either script (identical in both checkpoints)

`pom.xml`, `src/main/java/com/transglobe/policy/PolicyApplication.java`,
`src/main/java/com/transglobe/policy/model/Policy.java`,
`src/main/java/com/transglobe/policy/repository/PolicyRepository.java`.

## Scripts

### `scripts/apply-modernized.sh`

Copies all 12 files listed above (6 changed + 6 new) from `workshop/checkpoints/modernized/`
into their matching path under the project root, creating parent directories as needed.
Never deletes anything. Safe to re-run (re-copies the same content).

### `scripts/reset-baseline.sh`

Copies the 6 "changed" files from `workshop/checkpoints/baseline/` back into their matching
path, then removes (by exact, explicit, named path — never a glob) the 6 modernized-only
files if present, so the tree matches the original baseline exactly. Safe to re-run: the
copy step re-copies identical content, and the removal step is a no-op if the files are
already gone.

After removing the six modernized-only files, it also tries to remove the now-empty
`config/` and `exception/` package directories those files lived in, via
`rmdir -- "<dir>" 2>/dev/null || true`. `rmdir` only ever removes a directory that is
completely empty, so this is inherently safe: if the six files above were the only
contents, the directory disappears and the baseline tree shows no leftover empty
modernized-only packages; if anything else is present in the directory (e.g. a file left
behind manually), `rmdir` silently fails and nothing is deleted or recursed into.

### Post-operation "unexpected file" scan (both scripts)

After their main copy/remove work, **both** scripts run a final, read-only sanity scan of
`src/`:

- They enumerate every file under `src/` safely (NUL-delimited `find ... -print0` piped
  into a `while read -r -d ''` loop, so filenames with spaces/newlines can't break it).
  This enumeration is read-only and is never used to select files for deletion.
- Each file's path is checked against a `KNOWN_INVENTORY` array hard-coded in the script —
  the full, explicit union of every legitimate baseline, common, and modernized
  Java/properties/test file (15 entries: 3 common + 6 changed + 6 modernized-only).
- Any file **not** in that inventory (e.g. a stray/leftover file from manual edits during a
  live demo) triggers a loud, clearly-marked `!! WARNING: ...` message to stderr — but the
  script still exits `0` and does **not** delete, move, or otherwise touch that file.

This is intentionally a **warning, not a failure**: a live workshop/demo session should be
able to continue even if an unexpected file is present; the facilitator reviews and cleans
it up manually if needed.

Both scripts:
- resolve their own directory via `dirname "${BASH_SOURCE[0]}"` so they work from any cwd,
- sanity-check that `pom.xml` exists at the resolved project root before doing anything,
- use only explicit, hard-coded file/directory paths (no `rm -rf`, no wildcards/globs —
  `rmdir` and the unexpected-file scan are also glob-free and only ever read or remove
  exactly the named, empty directories),
- never modify `pom.xml` or any dependency.

## Verified build/test results (captured during this exercise)

Command used throughout: `mvn test` (Maven 3.6.3, Java 17, Spring Boot 3.2.4).

| Checkpoint | Result |
|---|---|
| Baseline (initial) | `BUILD SUCCESS` — Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 |
| After `scripts/apply-modernized.sh` | `BUILD SUCCESS` — Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 |
| After `scripts/reset-baseline.sh` | `BUILD SUCCESS` — Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 (file tree matches the original baseline exactly) |

Both scripts were also each executed twice in a row to confirm idempotency (no errors, no
diffs on the second run), and each was separately tested with a deliberately-planted stray
file under `src/` to confirm the unexpected-file scan prints a `WARNING` and exits `0`
without deleting the stray file. `reset-baseline.sh` was also confirmed to remove leftover
empty `config/`/`exception/` directories from a prior modernized checkpoint.
