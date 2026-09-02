#!/usr/bin/env bash
#
# reset-baseline.sh
#
# Restores the "baseline" workshop checkpoint by:
#   1. Copying a known, explicit set of files from workshop/checkpoints/baseline/
#      back into src/ (overwriting any modernized versions).
#   2. Removing the small, explicit, named set of files that exist ONLY in the
#      modernized checkpoint (so the tree matches the original baseline exactly).
#   3. Removing the (now empty) modernized-only "config" and "exception" package
#      directories via a safe `rmdir ... 2>/dev/null || true` -- rmdir only ever
#      removes an EMPTY directory, so this is a no-op if anything unexpected is
#      still inside, and never recurses or deletes files.
#   4. Ending with a read-only "unexpected file" scan of src/ against a known
#      inventory, printing a loud WARNING (never failing/deleting) for anything
#      unrecognized left behind.
#
# Safety:
#   - Every path acted upon is listed explicitly; no wildcards/globs are used.
#   - Only files/directories under this project's own src/ tree are ever touched.
#   - Idempotent: running it multiple times in a row is a no-op after the first run.
#
# Usage: scripts/reset-baseline.sh

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." >/dev/null 2>&1 && pwd -P)"
BASELINE_DIR="${PROJECT_ROOT}/workshop/checkpoints/baseline"

if [[ ! -f "${PROJECT_ROOT}/pom.xml" ]]; then
  echo "ERROR: ${PROJECT_ROOT}/pom.xml not found; refusing to run (unexpected project root)." >&2
  exit 1
fi

if [[ ! -d "${BASELINE_DIR}" ]]; then
  echo "ERROR: checkpoint directory not found: ${BASELINE_DIR}" >&2
  exit 1
fi

# Explicit list of files that differ between baseline and modernized (restored in place).
CHANGED_FILES=(
  "src/main/java/com/transglobe/policy/dto/PolicyRequest.java"
  "src/main/java/com/transglobe/policy/service/PolicyService.java"
  "src/main/java/com/transglobe/policy/web/PolicyController.java"
  "src/main/resources/application.properties"
  "src/test/java/com/transglobe/policy/service/PolicyServiceTest.java"
  "src/test/java/com/transglobe/policy/web/PolicyControllerTest.java"
)

# Explicit list of files that exist ONLY in the modernized checkpoint. Removed here
# (by exact, named path -- never a glob) so resetting fully restores the baseline tree.
MODERNIZED_ONLY_FILES=(
  "src/main/java/com/transglobe/policy/dto/PolicyResponse.java"
  "src/main/java/com/transglobe/policy/dto/ApiError.java"
  "src/main/java/com/transglobe/policy/config/PricingProperties.java"
  "src/main/java/com/transglobe/policy/exception/PolicyNotFoundException.java"
  "src/main/java/com/transglobe/policy/exception/UnsupportedPolicyTypeException.java"
  "src/main/java/com/transglobe/policy/exception/GlobalExceptionHandler.java"
)

echo "Restoring baseline checkpoint from: ${BASELINE_DIR}"
echo "Into project root:                 ${PROJECT_ROOT}"

for relative_path in "${CHANGED_FILES[@]}"; do
  src="${BASELINE_DIR}/${relative_path}"
  dest="${PROJECT_ROOT}/${relative_path}"

  if [[ ! -f "${src}" ]]; then
    echo "ERROR: expected checkpoint file missing: ${src}" >&2
    exit 1
  fi

  mkdir -p -- "$(dirname -- "${dest}")"
  cp -- "${src}" "${dest}"
  echo "  restored: ${relative_path}"
done

for relative_path in "${MODERNIZED_ONLY_FILES[@]}"; do
  target="${PROJECT_ROOT}/${relative_path}"
  if [[ -f "${target}" ]]; then
    rm -f -- "${target}"
    echo "  removed:  ${relative_path}"
  fi
done

# Explicit list of modernized-only package directories. rmdir only succeeds on an
# EMPTY directory, so this is inherently safe: if the six files above were the only
# contents, the directory disappears; if anything else is present, rmdir fails
# silently (via `2>/dev/null || true`) and nothing is deleted.
EMPTY_MODERNIZED_DIRS=(
  "src/main/java/com/transglobe/policy/config"
  "src/main/java/com/transglobe/policy/exception"
)

for relative_dir in "${EMPTY_MODERNIZED_DIRS[@]}"; do
  dir="${PROJECT_ROOT}/${relative_dir}"
  if [[ -d "${dir}" ]]; then
    rmdir -- "${dir}" 2>/dev/null || true
    if [[ ! -d "${dir}" ]]; then
      echo "  removed empty dir: ${relative_dir}"
    fi
  fi
done

# Full known inventory of every file that may legitimately exist under src/ in
# EITHER checkpoint (files common to both, baseline/modernized "changed" files,
# and modernized-only files). Read-only sanity check: never used to delete
# anything, only to flag files that don't belong to any known checkpoint.
KNOWN_INVENTORY=(
  "src/main/java/com/transglobe/policy/PolicyApplication.java"
  "src/main/java/com/transglobe/policy/model/Policy.java"
  "src/main/java/com/transglobe/policy/repository/PolicyRepository.java"
  "src/main/java/com/transglobe/policy/dto/PolicyRequest.java"
  "src/main/java/com/transglobe/policy/service/PolicyService.java"
  "src/main/java/com/transglobe/policy/web/PolicyController.java"
  "src/main/resources/application.properties"
  "src/test/java/com/transglobe/policy/service/PolicyServiceTest.java"
  "src/test/java/com/transglobe/policy/web/PolicyControllerTest.java"
  "src/main/java/com/transglobe/policy/dto/PolicyResponse.java"
  "src/main/java/com/transglobe/policy/dto/ApiError.java"
  "src/main/java/com/transglobe/policy/config/PricingProperties.java"
  "src/main/java/com/transglobe/policy/exception/PolicyNotFoundException.java"
  "src/main/java/com/transglobe/policy/exception/UnsupportedPolicyTypeException.java"
  "src/main/java/com/transglobe/policy/exception/GlobalExceptionHandler.java"
)

# Safely (NUL-delimited, no globs, read-only) enumerate every file under src/ and
# warn -- but never fail or delete -- if something outside the known inventory
# turns up (e.g. a stray file left behind by manual edits during a live demo).
warn_on_unexpected_files() {
  local src_dir="${PROJECT_ROOT}/src"
  [[ -d "${src_dir}" ]] || return 0

  local file relative_path known is_known found_unexpected=0

  while IFS= read -r -d '' file; do
    relative_path="${file#"${PROJECT_ROOT}/"}"
    is_known=0
    for known in "${KNOWN_INVENTORY[@]}"; do
      if [[ "${relative_path}" == "${known}" ]]; then
        is_known=1
        break
      fi
    done
    if [[ "${is_known}" -eq 0 ]]; then
      echo "!! WARNING: unexpected file under src/ (not in known checkpoint inventory): ${relative_path}" >&2
      found_unexpected=1
    fi
  done < <(find "${src_dir}" -type f -print0)

  if [[ "${found_unexpected}" -eq 1 ]]; then
    echo "!! WARNING: one or more unexpected files were found under src/." >&2
    echo "!! This script does NOT delete unrecognized files; review them manually." >&2
  fi

  return 0
}

echo ""
echo "Scanning src/ for unexpected files (informational only)..."
warn_on_unexpected_files

echo "Done. Baseline checkpoint restored (pom.xml was not touched)."
