#!/usr/bin/env bash
# Reapply Fases 1-2: design tokens + UI primitives from production EHS.
# Safe against local WIP in the real repo — reads from origin/main via git show.
set -euo pipefail

REAL_REPO_DEFAULT="/Users/kauedelazzeri/Documents/Git/dockerize/_repositories/ehs"
GIT_REF="origin/main"
TOKENS_SOURCE="client/src/index.css"
TOKENS_DEST="app/globals.css"
UI_SOURCE_PREFIX="client/src/components/ui"
UI_DEST_PREFIX="src/components/ui"

REAL_REPO="${1:-$REAL_REPO_DEFAULT}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROTOTYPE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GUARD_MANIFEST="$PROTOTYPE_ROOT/GUARD_PROTOTYPE_MANIFEST.md"

declare -a PROTECTED_PATHS=()
declare -a UPDATED=()
declare -a SKIPPED=()
declare -a UNCHANGED=()
TOKEN_STATUS="pending"

log() { printf '%s\n' "$*"; }

die() {
  log "ERROR: $*"
  exit 1
}

load_guard_manifest() {
  [[ -f "$GUARD_MANIFEST" ]] || die "Guard manifest not found: $GUARD_MANIFEST"

  local raw path
  while IFS= read -r raw; do
    path="${raw%% *}"
    path="${path%/}"
    [[ -n "$path" ]] || continue
    [[ "$path" == "app" ]] && continue
    PROTECTED_PATHS+=("$path")
  done < <(
    grep -E '^[[:space:]]*- `' "$GUARD_MANIFEST" \
      | grep -oE '`[^`]+`' \
      | tr -d '`' \
      | sed 's/ (.*//'
  )
}

is_protected() {
  local path="${1#/}"

  case "$path" in
    app/GUARD-*|app/GUARD-*/*) return 0 ;;
    *-guard-*) return 0 ;;
  esac

  local protected
  for protected in "${PROTECTED_PATHS[@]}"; do
    protected="${protected%/}"
    if [[ "$path" == "$protected" || "$path" == "$protected/"* ]]; then
      return 0
    fi
  done

  return 1
}

ensure_real_repo() {
  [[ -d "$REAL_REPO/.git" ]] || die "Real repo not found: $REAL_REPO"
  git -C "$REAL_REPO" fetch origin main --quiet 2>/dev/null || true
  git -C "$REAL_REPO" show "$GIT_REF:$TOKENS_SOURCE" >/dev/null \
    || die "Cannot read $GIT_REF:$TOKENS_SOURCE from $REAL_REPO"
}

git_show() {
  git -C "$REAL_REPO" show "$GIT_REF:$1"
}

file_hash() {
  if [[ -f "$1" ]]; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    echo "missing"
  fi
}

write_if_changed() {
  local dest="$1"
  local tmp="$2"

  local old_hash new_hash
  old_hash="$(file_hash "$dest")"
  new_hash="$(file_hash "$tmp")"

  if [[ "$old_hash" == "$new_hash" ]]; then
    UNCHANGED+=("$dest")
    rm -f "$tmp"
    return 1
  fi

  mkdir -p "$(dirname "$dest")"
  mv "$tmp" "$dest"
  UPDATED+=("$dest")
  return 0
}

extract_ehs_preserve_block() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  awk '/^@keyframes slideIn/{found=1} found{print}' "$file"
}

sync_tokens() {
  local dest_rel="$TOKENS_DEST"
  local dest="$PROTOTYPE_ROOT/$dest_rel"

  if is_protected "$dest_rel"; then
    SKIPPED+=("$dest_rel (protected)")
    TOKEN_STATUS="SKIPPED"
    return
  fi

  local tmp preserve
  tmp="$(mktemp)"
  git_show "$TOKENS_SOURCE" >"$tmp"

  preserve="$(extract_ehs_preserve_block "$dest")"
  if [[ -n "$preserve" ]]; then
    {
      cat "$tmp"
      printf '\n'
      printf '%s\n' "$preserve"
    } >"${tmp}.merged"
    mv "${tmp}.merged" "$tmp"
  fi

  if write_if_changed "$dest" "$tmp"; then
    TOKEN_STATUS="UPDATED"
  else
    TOKEN_STATUS="UNCHANGED"
  fi
}

sync_ui_primitives() {
  local rel_path dest_rel dest tmp content old_content

  while IFS= read -r rel_path; do
    [[ -n "$rel_path" ]] || continue

    dest_rel="${rel_path/#$UI_SOURCE_PREFIX/$UI_DEST_PREFIX}"
    dest="$PROTOTYPE_ROOT/$dest_rel"

    if is_protected "$dest_rel"; then
      SKIPPED+=("$dest_rel (protected)")
      continue
    fi

    tmp="$(mktemp)"
    git_show "$rel_path" >"$tmp"
    write_if_changed "$dest" "$tmp" || true
  done < <(
    git -C "$REAL_REPO" ls-tree -r --name-only "$GIT_REF" "$UI_SOURCE_PREFIX/" \
      | grep -E "^${UI_SOURCE_PREFIX}/[^/]+\\.tsx$"
  )
}

count_ui_matches() {
  local pattern="$1"
  shift
  local item count=0
  for item in "$@"; do
    [[ "$item" == *"$pattern"* ]] && count=$((count + 1))
  done
  echo "$count"
}

print_summary() {
  local ui_updated ui_unchanged ui_skipped
  ui_updated="$(count_ui_matches "$UI_DEST_PREFIX" ${UPDATED[@]+"${UPDATED[@]}"})"
  ui_unchanged="$(count_ui_matches "$UI_DEST_PREFIX" ${UNCHANGED[@]+"${UNCHANGED[@]}"})"
  ui_skipped="$(count_ui_matches "$UI_DEST_PREFIX" ${SKIPPED[@]+"${SKIPPED[@]}"})"

  log ""
  log "=== sync-ui-from-real.sh (ehs-prototype) ==="
  log "Real repo: $REAL_REPO ($GIT_REF)"
  log "Guard manifest: ${#PROTECTED_PATHS[@]} protected path(s)"
  log ""
  log "Phase 1 — Design Tokens ($TOKENS_SOURCE → $TOKENS_DEST):"
  log "  $TOKEN_STATUS: $TOKENS_DEST"
  log ""
  log "Phase 2 — UI Primitives ($UI_SOURCE_PREFIX → $UI_DEST_PREFIX):"
  log "  Updated:   $ui_updated"
  log "  Unchanged: $ui_unchanged"
  log "  Skipped:   $ui_skipped"
  log ""

  if ((${#UPDATED[@]})); then
    log "Updated files:"
    printf '  - %s\n' "${UPDATED[@]}"
  fi

  if ((${#SKIPPED[@]})); then
    log "Skipped files:"
    printf '  - %s\n' "${SKIPPED[@]}"
  fi

  log "Done."
}

main() {
  load_guard_manifest
  ensure_real_repo
  sync_tokens
  sync_ui_primitives
  print_summary
}

main "$@"
