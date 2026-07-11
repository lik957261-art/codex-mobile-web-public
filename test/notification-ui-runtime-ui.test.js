"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const notificationUiRuntimeJs = fs.readFileSync(path.join(root, "public", "notification-ui-runtime.js"), "utf8");
const notificationUiRuntime = require(path.join(root, "public", "notification-ui-runtime.js"));

test("notification UI runtime preserves CommonJS and legacy global entry points", () => {
  assert.equal(typeof notificationUiRuntime.createNotificationUiRuntime, "function");
  const runtime = notificationUiRuntime.createNotificationUiRuntime();
  for (const name of [
    "handlePluginVoiceInputMessage",
    "requestHermesPluginRefresh",
    "showPluginEmbedRecovering",
    "showLogin",
    "showApp",
    "bootstrap",
  ]) {
    assert.equal(typeof runtime[name], "function", `${name} should be exported`);
  }
  for (const name of [
    "showApp",
    "showLogin",
    "bootstrap",
    "sortTurnsForDisplay",
    "requestHermesPluginRefresh",
    "handleServiceWorkerMessage",
    "applyUrlThreadSelection",
    "publishPluginVoiceInputCapability",
  ]) {
    assert.equal(typeof globalThis[name], "function", `${name} should remain a legacy global`);
  }
  assert.equal(globalThis.CodexNotificationUiRuntime, notificationUiRuntime);
  assert.match(notificationUiRuntimeJs, /module\.exports = notificationUiRuntimeApi/);
  assert.match(notificationUiRuntimeJs, /root\.CodexNotificationUiRuntime = notificationUiRuntimeApi/);
});

test("notification UI startup does not block on workspace refresh", () => {
  const bootstrapStart = notificationUiRuntimeJs.indexOf("async function bootstrap()");
  const bootstrapEnd = notificationUiRuntimeJs.indexOf("function threadIdFromUrlValue", bootstrapStart);
  const bootstrapSource = notificationUiRuntimeJs.slice(bootstrapStart, bootstrapEnd);
  assert.match(bootstrapSource, /loadWorkspaces\(\{ timeoutMs: 8000 \}\)\.then/);
  assert.doesNotMatch(bootstrapSource, /await loadWorkspaces\(\);/);
  assert.match(bootstrapSource, /api\("\/api\/status", \{ timeoutMs: 8000 \}\)/);
  assert.match(bootstrapSource, /loadThreadDisplaySettings\(\{ render: false, timeoutMs: 3000 \}\)/);
  assert.doesNotMatch(bootstrapSource, /loadThreadDisplaySettings[\s\S]*\.catch\(showError\)/);
});
