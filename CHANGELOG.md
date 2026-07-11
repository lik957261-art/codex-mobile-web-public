# Changelog

## 0.1.13 - 2026-07-11

- Restore the complete production `services/runtime/` source tree that an
  over-broad public-export ignore rule previously omitted.
- Integrate upstream `pentiumxp/codex-mobile-web-public` through commit
  `5f5d8e9`, including Remote Managed Workspace, `@loop`, worker lifecycle,
  task-card execution authority, and the original native frontend sources.
- Preserve the v0.1.12 mobile startup, login, touch, voice-input, runtime cache,
  launcher discovery, and classic-shell stability improvements.
- Reduce mobile list and sidebar overhead with a 40-thread initial cap, a
  restored collapse control, Android back/edge-swipe handling, and an explicit
  composer target indicator.
- Keep `/api/status` responsive with coalesced background refresh and bounded
  mux metrics, while preserving network-first update/event requests and
  immutable caching for hashed frontend assets.
- Advance the generated shell identity to `codex-mobile-shell-v629` and retain
  the classic shell as the production default.
- Keep credentials, local runtime state, databases, logs, uploads, outputs,
  backups, and agent context outside the public repository.

## 0.1.12 - 2026-07-11

- Reduce mobile startup latency with a stable classic-shell default, deferred
  non-critical work, bounded runtime caches, and prewarmed thread list/detail
  paths.
- Split server, route, thread-list, thread-detail, task-card, and browser runtime
  responsibilities into testable services while preserving existing behavior.
- Add Vite shell artifact generation and manifest verification without changing
  the production classic-shell default.
- Improve active-turn recovery, client event diagnostics, notification handling,
  media preview, and mobile render stability.
- Discover the current ChatGPT-bundled or legacy Codex executable automatically
  on macOS.
- Discover packaged Node, Homebrew Node 24, standard Homebrew Node, or PATH Node
  in that order so LaunchAgents do not depend on temporary cache locations.
- Refresh the verified Vite build toolchain to `8.1.4` with no production shell
  default change.
- Keep machine-specific launch wrappers, credentials, runtime databases, logs,
  outputs, backups, uploads, and agent context outside the public repository.

## 0.1.11

- Public base release with the Codex Mobile Web classic shell, shared app-server
  mux support, thread and task-card workflows, PWA updates, and mobile recovery.
