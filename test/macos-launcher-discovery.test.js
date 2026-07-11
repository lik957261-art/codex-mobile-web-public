"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const launcher = fs.readFileSync(path.join(repoRoot, "start-codex-mobile-web-macos.sh"), "utf8");
const publicLauncherPath = path.join(repoRoot, "run-codex-mobile-web-public.sh");
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));

test("macOS launcher discovers current and legacy desktop Codex executables", () => {
  assert.match(launcher, /\/Applications\/ChatGPT\.app\/Contents\/Resources\/codex/);
  assert.match(launcher, /\/Applications\/Codex\.app\/Contents\/Resources\/codex/);
  assert.match(launcher, /CODEX_DESKTOP_APP_PATH/);
  assert.match(launcher, /default_codex_executable/);
});

test("macOS launcher discovers packaged and Homebrew Node executables", () => {
  assert.match(launcher, /default_node_executable/);
  assert.match(launcher, /runtime\/node-current\/bin\/node/);
  assert.match(launcher, /\/opt\/homebrew\/opt\/node@24\/bin\/node/);
  assert.match(launcher, /\/usr\/local\/opt\/node@24\/bin\/node/);
});

test("public package excludes the machine-specific production wrapper", () => {
  assert.equal(fs.existsSync(publicLauncherPath), false);
  assert.doesNotMatch(packageJson.scripts["check:macos"], /run-codex-mobile-web-public\.sh/);
});
