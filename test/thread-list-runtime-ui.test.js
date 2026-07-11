"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

const { createThreadListRuntime } = require(path.resolve(__dirname, "..", "public", "thread-list-runtime.js"));
const threadListLoadPolicy = require(path.resolve(__dirname, "..", "public", "thread-list-load-policy.js"));

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeFsPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/\/+$/g, "").toLowerCase();
}

function basenameForFsPath(value) {
  const parts = normalizeFsPath(value).split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function createThreadListElements() {
  const list = {
    innerHTML: "",
    querySelectorAll: () => [],
  };
  const search = { value: "" };
  return {
    list,
    search,
    get: (id) => id === "threadList" ? list : id === "threadSearch" ? search : null,
  };
}

function createThreadListState(overrides = {}) {
  return Object.assign({
    selectedCwd: "",
    workspaces: [],
    threads: [],
    currentThread: null,
    currentThreadId: "",
    unreadThreadIds: new Set(),
    renderedThreadListSignature: "",
    threadListLoadSeq: 0,
    threadListLoadedAtMs: 0,
  }, overrides);
}

function createRuntime(state, overrides = {}) {
  return createThreadListRuntime(Object.assign({
    state,
    $: () => null,
    api: async () => ({}),
    document: { documentElement: { clientHeight: 800 } },
    window: { innerHeight: 800 },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout,
    clearTimeout,
    THREAD_LIST_PAGE_LIMIT: 40,
    THREAD_LIST_DEFERRED_FALLBACK_DELAY_MS: 200,
    THREAD_LIST_DEFERRED_FALLBACK_RETRY_MS: 1000,
    THREAD_LIST_SLOW_PATH_MS: 2500,
    STORAGE_THREAD_ID: "threadId",
    normalizeFsPath,
    escapeHtml,
    shortPath: (value) => basenameForFsPath(value) || String(value || ""),
    isMobileViewport: () => false,
    tokenCountValue: (value) => Number(value || 0),
    formatTokenMillion: (value) => String(value || 0),
    displayInputTokensExcludingCached: () => 0,
    saveCurrentDraftNow: () => {},
    flushSideChatDraftNow: () => {},
    resetComposerRuntimeSelection: () => {},
    abortCurrentThreadRefresh: () => {},
    clearRecentCompletedReplyAnchor: () => {},
    clearConversationAutoScrollHold: () => {},
    setComposerText: () => {},
    replacePendingAttachments: () => {},
    syncActiveTurnFromThread: () => {},
    connectEvents: () => {},
    threadListLoadPolicy,
    nowPerfMs: () => 0,
    roundedDurationMs: (value) => value,
    threadListSummaryFromDetailThread: (thread) => thread,
    threadListStableOrderPolicy: { mergeThreadListsStable: ({ currentThreads, incomingThreads }) => incomingThreads || currentThreads || [] },
    reconcileThreadStatusHints: () => {},
    renderCurrentThread: () => {},
    threadTileLayout: () => ({ enabled: false }),
    isThreadTileKeyboardFocusActive: () => false,
    threadTileCandidateIds: () => [],
    threadTileIdsEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    restoreConnectionState: () => {},
    scheduleVisiblePageRefreshCheck: () => {},
    threadPerformanceMetrics: { threadListRenderedPlan: () => ({ action: "none" }) },
    postPerformanceEvent: () => {},
    diagnosticDurationBucket: () => "fast",
    recordHomeAiDiagnosticFailure: () => {},
    recordHomeAiDiagnosticSuccess: () => {},
    threadDiagnosticEventsApi: {},
    renderThreadLoadError: () => {},
    diagnosticErrorCode: () => "",
    diagnosticErrorStatus: () => 0,
    showError: (err) => { throw err; },
    visibleWorkspaceKeys: () => new Set(state.workspaces.map((workspace) => normalizeFsPath(workspace.cwd))),
    codexWorktreeRepoName: () => "",
    basenameForFsPath,
    visibleWorkspaceNames: () => new Set(state.workspaces.map((workspace) => basenameForFsPath(workspace.cwd))),
    statusText: (status) => String(status && (status.text || status.type) || ""),
    scheduleRenderCurrentThread: () => {},
    threadTilePaneIsVisible: () => false,
    scheduleRenderThreadTilePane: () => false,
    updateThreadStatusHints: () => {},
    normalizeThreadGoal: (goal) => goal || null,
    updateThreadGoalDialogState: () => {},
    draftStore: {},
    readDraftMap: () => ({}),
    draftHasContent: () => false,
    restoreDraftForCurrentTarget: () => {},
    updateComposerControls: () => {},
    showHermesPluginPrimaryPage: () => {},
    isHermesEmbedMode: () => false,
    loadThread: async () => {},
    isRunningStatus: () => false,
    rolloutSizeText: () => "",
    isRolloutOverThreshold: () => false,
    formatAbsoluteTime: () => "",
    formatTime: () => "",
    statusIconHtml: () => "",
    statusIconInfo: () => ({}),
    threadGoalForThread: () => null,
    renderThreadGoalBadge: () => "",
    handleThreadCardClick: () => {},
    threadGoalSignature: () => "",
    rolloutSizeBytes: () => 0,
  }, overrides));
}

test("thread list runtime owns workspace menu labels and cwd visibility filtering", () => {
  const state = {
    workspaceCreateEnabled: true,
    workspaceCreateRoot: "/repos",
    selectedCwd: "/repos/music",
    workspaces: [{ cwd: "/repos/music", label: "Music", recentThreadCount: 2 }],
    threads: [
      { id: "music-a", cwd: "/repos/music", name: "Music A" },
      { id: "other-a", cwd: "/repos/other", name: "Other A" },
      { id: "archived-a", cwd: "/repos/music", archived: true, name: "Archived A" },
    ],
  };
  const runtime = createRuntime(state);

  assert.equal(runtime.selectedWorkspaceLabel(), "Music");
  const menuHtml = runtime.workspaceSidebarOptionsHtml();
  assert.ok(menuHtml.includes("Music (2) - /repos/music"));
  assert.match(menuHtml, /Create Workspace/);

  assert.deepEqual(runtime.visibleThreads().map((thread) => thread.id), ["music-a"]);
  assert.equal(runtime.threadMatchesWorkspaceCwd("/tmp/.codex/worktrees/abc/music", "/repos/music"), false);
});

test("thread list deferred fallback waits while a thread detail is selected", () => {
  const timers = [];
  let apiCallCount = 0;
  const state = {
    selectedCwd: "",
    workspaces: [],
    currentThread: { id: "thread-1" },
    currentThreadId: "thread-1",
  };
  const runtime = createRuntime(state, {
    api: async () => {
      apiCallCount += 1;
      return { data: [] };
    },
    setTimeout: (fn, delayMs) => {
      const timer = { fn, delayMs };
      timers.push(timer);
      return timer;
    },
    clearTimeout: () => {},
    $: (id) => (id === "threadSearch" ? { value: "" } : null),
  });

  runtime.scheduleThreadListDeferredFallback(1);

  assert.equal(timers.length, 1);
  timers.shift().fn();
  assert.equal(apiCallCount, 0);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delayMs, 1000);
});

test("thread list cache persists only bounded summaries and restores them before workspace fetch", async () => {
  const storage = createMemoryStorage();
  const sourceElements = createThreadListElements();
  const sourceState = createThreadListState({
    threads: Array.from({ length: 45 }, (_, index) => ({
      id: `cached-${index}`,
      name: `Cached ${index}`,
      cwd: "/repo",
      updatedAt: 1000 - index,
      turns: [{ id: `private-turn-${index}`, items: [{ text: "not cached" }] }],
    })),
  });
  const sourceRuntime = createRuntime(sourceState, {
    $: sourceElements.get,
    localStorage: storage,
  });

  assert.equal(sourceRuntime.persistThreadListCache(), true);
  const payload = JSON.parse(storage.getItem("codexMobileThreadListCacheV1"));
  assert.equal(payload.version, 1);
  assert.equal(payload.threads.length, 40);
  assert.equal(Object.hasOwn(payload.threads[0], "turns"), false);

  let resolveWorkspaces;
  let workspaceRequestOptions = null;
  const targetElements = createThreadListElements();
  const targetState = createThreadListState({
    threads: [{ id: "current", name: "Current", cwd: "/repo", updatedAt: 2000 }],
  });
  const targetRuntime = createRuntime(targetState, {
    $: targetElements.get,
    localStorage: storage,
    api: async (_path, options) => {
      workspaceRequestOptions = options;
      return new Promise((resolve) => { resolveWorkspaces = resolve; });
    },
  });

  const workspacePromise = targetRuntime.loadWorkspaces({ timeoutMs: 8000 });
  assert.equal(targetState.threads.length, 40);
  assert.equal(targetState.threads[0].id, "current");
  assert.match(targetElements.list.innerHTML, /Cached 0/);
  assert.deepEqual(workspaceRequestOptions, { timeoutMs: 8000 });

  resolveWorkspaces({ data: [] });
  await workspacePromise;
});

test("silent thread list refresh keeps an existing cached list when the network times out", async () => {
  const elements = createThreadListElements();
  const state = createThreadListState({
    threads: [{ id: "cached", name: "Cached", cwd: "/repo", updatedAt: 1000 }],
  });
  let renderedErrorCount = 0;
  const runtime = createRuntime(state, {
    $: elements.get,
    api: async () => { throw new Error("Request timed out: /api/threads"); },
    renderThreadLoadError: () => { renderedErrorCount += 1; },
  });

  const result = await runtime.loadThreads({ silent: true, allowDuringDetail: true });

  assert.equal(result, null);
  assert.equal(renderedErrorCount, 0);
  assert.deepEqual(state.threads.map((thread) => thread.id), ["cached"]);
});
