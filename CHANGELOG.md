# Changelog

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
