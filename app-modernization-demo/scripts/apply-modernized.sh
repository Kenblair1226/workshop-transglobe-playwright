#!/usr/bin/env bash
#
# apply-modernized.sh
#
# Applies the "modernized" workshop checkpoint on top of the current source tree
# by copying a known, explicit set of files from workshop/checkpoints/modernized/
# into src/. This script:
#   - never deletes anything (modernization is purely additive/overwriting),
#   - never uses wildcards/globs to select files (every path is listed explicitly),
#   - resolves all paths relative to its own location, so it works from any cwd,
#   - is idempotent: running it multiple times in a row is a no-op after the first run,
#   - ends with a read-only "unexpected file" scan of src/ against a known inventory,
#     printing a loud WARNING (never failing/deleting) for anything unrecognized.
#
# Usage: scripts/apply-modernized.sh

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." >/dev/null 2>&1 && pwd -P)"
MODERNIZED_DIR="${PROJECT_ROOT}/workshop/checkpoints/modernized"

if [[ ! -f "${PROJECT_ROOT}/pom.xml" ]]; then
  echo "ERROR: ${PROJECT_ROOT}/pom.xml not found; refusing to run (unexpected project root)." >&2
  exit 1
fi

if [[ ! -d "${MODERNIZED_DIR}" ]]; then
  echo "ERROR: checkpoint directory not found: ${MODERNIZED_DIR}" >&2
  exit 1
fi

# Explicit list of files that differ between baseline and modernized (overwritten in place).
CHANGED_FILES=(
  "src/main/java/com/transglobe/policy/dto/PolicyRequest.java"
  "src/main/java/com/transglobe/policy/service/PolicyService.java"
  "src/main/java/com/transglobe/policy/web/PolicyController.java"
  "src/main/resources/application.properties"
  "src/test/java/com/transglobe/policy/service/PolicyServiceTest.java"
  "src/test/java/com/transglobe/policy/web/PolicyControllerTest.java"
)

# Explicit list of files that exist ONLY in the modernized checkpoint (newly added).
NEW_FILES=(
  "src/main/java/com/transglobe/policy/dto/PolicyResponse.java"
  "src/main/java/com/transglobe/policy/dto/ApiError.java"
  "src/main/java/com/transglobe/policy/config/PricingProperties.java"
  "src/main/java/com/transglobe/policy/exception/PolicyNotFoundException.java"
  "src/main/java/com/transglobe/policy/exception/UnsupportedPolicyTypeException.java"
  "src/main/java/com/transglobe/policy/exception/GlobalExceptionHandler.java"
)

echo "Applying modernized checkpoint from: ${MODERNIZED_DIR}"
echo "Into project root:                  ${PROJECT_ROOT}"

for relative_path in "${CHANGED_FILES[@]}" "${NEW_FILES[@]}"; do
  src="${MODERNIZED_DIR}/${relative_path}"
  dest="${PROJECT_ROOT}/${relative_path}"

  if [[ ! -f "${src}" ]]; then
    echo "ERROR: expected checkpoint file missing: ${src}" >&2
    exit 1
  fi

  mkdir -p -- "$(dirname -- "${dest}")"
  cp -- "${src}" "${dest}"
  echo "  copied: ${relative_path}"
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

echo "Done. Modernized checkpoint applied (pom.xml was not touched)."
