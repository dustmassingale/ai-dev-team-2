/**
 * Enhanced Git Integration for AWM Project
 *
 * Responsibilities:
 * - Create feature/bugfix branches from base (main/develop)
 * - Run tests before commits (lint, unit, integration)
 * - Auto-generate conventional commit messages when one is not provided
 * - Commit changes only if tests pass (or with --force)
 * - Create pull requests and attach review comments (uses GitHub CLI when available)
 * - Improve merge conflict suggestions: parse conflict markers and produce actionable suggestions
 *
 * Usage (examples):
 *   node git_integration.js create-branch feature "Add new kanban UI"
 *   node git_integration.js run-tests
 *   node git_integration.js commit "feat: add kanban drag-and-drop"
 *   node git_integration.js auto-commit --type feat
 *   node git_integration.js create-pr main feature/add-kanban --attach-comments comments.json
 *   node git_integration.js suggest-merge path/to/conflicted/file.js
 *
 * Notes:
 * - This script prefers the GitHub CLI (`gh`) for PR operations. If `gh` is not available,
 *   it will output the equivalent commands to run manually.
 * - Test commands default to `npm run lint`, `npm run test`, `npm run integration-test`.
 *   You can override these by setting environment variables: AWM_LINT_CMD, AWM_UNIT_CMD, AWM_INTEGRATION_CMD.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DEFAULTS = {
  BASE_BRANCH: process.env.AWM_BASE_BRANCH || "main",
  LINT_CMD: process.env.AWM_LINT_CMD || "npm run lint",
  UNIT_CMD: process.env.AWM_UNIT_CMD || "npm run test",
  INTEGRATION_CMD:
    process.env.AWM_INTEGRATION_CMD || "npm run integration-test",
};

/**
 * Run a shell command synchronously and return result.
 * Throws error on non-zero exit code unless opts.allowFailure is true.
 * @param {string} cmd
 * @param {{cwd?:string, allowFailure?:boolean}} opts
 * @returns {{success:boolean, stdout:string, stderr:string}}
 */
function run(cmd, opts = {}) {
  try {
    const stdout = execSync(cmd, {
      stdio: "pipe",
      encoding: "utf-8",
      cwd: opts.cwd || process.cwd(),
    }).trim();
    return { success: true, stdout, stderr: "" };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    if (opts.allowFailure) {
      return {
        success: false,
        stdout: err.stdout ? err.stdout.toString() : "",
        stderr,
      };
    }
    console.error(`[error] Command failed: ${cmd}\n${stderr}`);
    throw new Error(`Command failed: ${cmd}\n${stderr}`);
  }
}

/**
 * Safely check if a binary exists on PATH by attempting to run it with --version
 * @param {string} binary
 * @returns {boolean}
 */
function hasBinary(binary) {
  try {
    run(`${binary} --version`, { allowFailure: false });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Create a branch from base and check it out.
 * @param {'feature'|'bugfix'} type
 * @param {string} name - human readable name e.g. "Add Kanban"
 * @param {string} base
 */
function createBranch(type, name, base = DEFAULTS.BASE_BRANCH) {
  if (!["feature", "bugfix"].includes(type)) {
    throw new Error('Branch type must be "feature" or "bugfix"');
  }
  if (!name || name.length === 0) {
    throw new Error("Branch name required");
  }
  const slug = name
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .toLowerCase();
  const branchName = `${type}/${slug}`;
  console.log(`[info] Creating branch ${branchName} from ${base}`);

  run(`git fetch --all`);
  run(`git checkout ${base}`);
  run(`git pull origin ${base}`);
  run(`git checkout -b ${branchName}`);

  console.log(`✅ Created and switched to branch: ${branchName}`);
  return branchName;
}

/**
 * Run lint, unit, and integration tests. Returns aggregated result.
 * Does not throw by default; caller can decide to block commit.
 * @returns {{lint:{success:boolean, output:string}, unit:{success:boolean, output:string}, integration:{success:boolean, output:string}, allPassed:boolean}}
 */
function runTests() {
  console.log("[info] Running lint...");
  let lint = { success: true, output: "" };
  try {
    const res = run(DEFAULTS.LINT_CMD, { allowFailure: false });
    lint.output = res.stdout;
  } catch (e) {
    lint.success = false;
    lint.output = e.message;
  }

  console.log("[info] Running unit tests...");
  let unit = { success: true, output: "" };
  try {
    const res = run(DEFAULTS.UNIT_CMD, { allowFailure: false });
    unit.output = res.stdout;
  } catch (e) {
    unit.success = false;
    unit.output = e.message;
  }

  console.log("[info] Running integration tests...");
  let integration = { success: true, output: "" };
  try {
    const res = run(DEFAULTS.INTEGRATION_CMD, { allowFailure: false });
    integration.output = res.stdout;
  } catch (e) {
    integration.success = false;
    integration.output = e.message;
  }

  const allPassed = lint.success && unit.success && integration.success;

  console.log("--- Test Summary ---");
  console.log(`Lint: ${lint.success ? "PASS" : "FAIL"}`);
  console.log(`Unit: ${unit.success ? "PASS" : "FAIL"}`);
  console.log(`Integration: ${integration.success ? "PASS" : "FAIL"}`);

  return { lint, unit, integration, allPassed };
}

/**
 * Inspect staged changes and generate a conventional commit message if one is not provided.
 * Strategy:
 *  - Look at staged files; if tests changed -> "test: ..."
 *  - If package or build files changed -> "chore: ..."
 *  - If src files changed -> "feat:" or "fix:" heuristically (presence of 'fix' in diff or 'bug' in filenames)
 *
 * @param {string} providedMessage - if provided, return as-is
 * @returns {string}
 */
function generateCommitMessage(providedMessage) {
  if (providedMessage && providedMessage.trim().length > 0) {
    return providedMessage.trim();
  }

  // Get staged file list
  let staged;
  try {
    staged = run("git diff --name-only --cached")
      .stdout.split(/\r?\n/)
      .filter(Boolean);
  } catch (e) {
    staged = [];
  }

  if (staged.length === 0) {
    // nothing staged - fallback message
    return "chore: update project";
  }

  const fileSet = new Set(staged);
  const stagedStr = staged.join(" ");
  // heuristics
  if (
    staged.some(
      (f) =>
        /(^|\/)(test|__tests__|spec)\b/i.test(f) ||
        /(\.test\.|\.spec\.)/.test(f),
    )
  ) {
    return `test: ${staged[0]} and related tests`;
  }
  if (
    staged.some((f) =>
      /(^|\/)(package\.json|yarn\.lock|package-lock\.json|build|webpack|rollup|Dockerfile)\b/i.test(
        f,
      ),
    )
  ) {
    return `chore: update build or dependency files (${staged[0]})`;
  }
  if (
    staged.some(
      (f) => /^src\//i.test(f) || /(\.js|\.ts|\.jsx|\.tsx|\.py|\.go)$/i.test(f),
    )
  ) {
    // try to detect if it's a fix (diff contains "fix" / "bugfix") otherwise feat
    let diff = "";
    try {
      diff = run("git diff --cached --unified=0").stdout;
    } catch (e) {
      diff = "";
    }
    if (/fix(es|ed)?|bug|error|panic|exception/i.test(diff + " " + stagedStr)) {
      return `fix: resolve issue in ${staged[0]}`;
    }
    return `feat: implement ${staged[0]}`;
  }

  // default
  return `chore: update ${staged[0]}`;
}

/**
 * Commit staged changes after running tests (unless --no-test or --force is specified)
 * @param {string} message - optional commit message
 * @param {{noTest?:boolean, force?:boolean}} opts
 */
function commitChanges(message, opts = {}) {
  opts = opts || {};
  const commitMessage = generateCommitMessage(message);

  if (!opts.noTest) {
    const results = runTests();
    if (!results.allPassed && !opts.force) {
      console.error(
        "[error] Tests failed. Aborting commit. Use --force to override.",
      );
      process.exit(2);
    } else if (!results.allPassed && opts.force) {
      console.warn(
        "[warn] Tests failed but proceeding with commit due to --force",
      );
    }
  }

  // Stage everything by default
  try {
    run("git add .");
  } catch (e) {
    console.error("[error] Failed to stage changes:", e.message);
    process.exit(3);
  }

  try {
    run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    console.log(`✅ Committed: "${commitMessage}"`);
  } catch (e) {
    console.error("[error] Commit failed:", e.message);
    process.exit(4);
  }
}

/**
 * Create a pull request using GitHub CLI if available; otherwise print instructions.
 * Optionally attach review comments from a JSON file or an array.
 *
 * @param {string} base
 * @param {string} head
 * @param {{title?:string, body?:string, attachCommentsPath?:string}} opts
 * @returns {number|null} PR number if created and parsed, otherwise null
 */
function createPullRequest(base, head, opts = {}) {
  opts = opts || {};
  const title = opts.title || `${head}`;
  const body = opts.body || `Automated PR for ${head}`;
  console.log(`[info] Creating PR from ${head} -> ${base}`);

  if (hasBinary("gh")) {
    try {
      // gh pr create returns human-oriented output; use --json to parse if supported
      // First, try to create and capture JSON
      const createCmd = `gh pr create --base ${base} --head ${head} --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" --json number,url --jq .number`;
      const res = run(createCmd);
      const prNumberStr = res.stdout.trim();
      const prNumber = parseInt(prNumberStr, 10);
      if (!isNaN(prNumber)) {
        console.log(`✅ Created PR #${prNumber} (${head} -> ${base})`);
        // Attach comments if provided
        if (opts.attachCommentsPath) {
          attachReviewCommentsToPR(prNumber, opts.attachCommentsPath);
        }
        return prNumber;
      } else {
        console.log(
          "[warn] Could not parse PR number from gh output. Output:",
          res.stdout,
        );
        return null;
      }
    } catch (e) {
      console.error("[error] gh failed to create PR:", e.message);
      console.log("[info] Falling back to manual instructions.");
    }
  }

  // Fallback: print command for user
  console.log(
    `Run the following to create the PR manually:\n\n  git push --set-upstream origin ${head}\n  gh pr create --base ${base} --head ${head} --title "${title}" --body "${body}"\n`,
  );
  if (opts.attachCommentsPath) {
    console.log(
      `Then attach comments from ${opts.attachCommentsPath} via 'gh pr comment <PR_NUMBER> --body "<comment>"'`,
    );
  }
  return null;
}

/**
 * Attach review comments to a PR. The commentsPath should be a JSON file containing an array of comments:
 * [
 *   {"body":"Comment text"},
 *   {"body":"Another comment"}
 * ]
 *
 * If GitHub CLI is available, this will call `gh pr comment <number> --body "..."` for each.
 *
 * @param {number} prNumber
 * @param {string} commentsPath
 */
function attachReviewCommentsToPR(prNumber, commentsPath) {
  if (!prNumber) {
    console.error("[error] attachReviewCommentsToPR requires a PR number.");
    return;
  }
  if (!fs.existsSync(commentsPath)) {
    console.error(`[error] Comments file not found: ${commentsPath}`);
    return;
  }
  let comments;
  try {
    const raw = fs.readFileSync(commentsPath, "utf-8");
    comments = JSON.parse(raw);
    if (!Array.isArray(comments)) {
      throw new Error(
        'Comments file must be an array of objects with a "body" property.',
      );
    }
  } catch (e) {
    console.error("[error] Failed to parse comments file:", e.message);
    return;
  }

  if (!hasBinary("gh")) {
    console.warn(
      "[warn] GitHub CLI not available. Printing comments for manual posting.",
    );
    comments.forEach((c, idx) => {
      console.log(`--- Comment ${idx + 1} ---\n${c.body}\n`);
    });
    return;
  }

  comments.forEach((c, idx) => {
    const body = (c.body || "").replace(/"/g, '\\"');
    try {
      run(`gh pr comment ${prNumber} --body "${body}"`);
      console.log(`✅ Attached comment ${idx + 1} to PR #${prNumber}`);
    } catch (e) {
      console.error(`[error] Failed to attach comment ${idx + 1}:`, e.message);
    }
  });
}

/**
 * Suggest merge resolutions for a conflicted file.
 * Parses conflict markers and produces three candidate resolutions:
 *  - OURS (keep current branch)
 *  - THEIRS (accept incoming)
 *  - MERGED (attempt a naive merge combining unique lines)
 *
 * Writes suggestions to <conflict-file>.merge_suggestions.json and prints summary.
 *
 * @param {string} conflictFile
 * @returns {{conflictCount:number, suggestionsPath:string}}
 */
function suggestMerge(conflictFile) {
  if (!fs.existsSync(conflictFile)) {
    console.error(`[error] File not found: ${conflictFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(conflictFile, "utf-8");

  // Find conflict blocks
  // Format:
  // <<<<<<< HEAD
  // ...
  // =======
  // ...
  // >>>>>>> branch
  const conflictRegex =
    /<<<<<<<\s*(?:HEAD)?\s*[\r\n]([\s\S]*?)=======([\s\S]*?)>>>>>>>[^\r\n]*/g;
  let match;
  const suggestions = [];
  let idx = 0;
  while ((match = conflictRegex.exec(content)) !== null) {
    idx += 1;
    const ours = match[1].trimRight();
    const theirs = match[2].trimRight();

    // Simple merged candidate: include lines from ours, then any lines from theirs that are not duplicate
    const oursLines = ours.split(/\r?\n/).map((s) => s.trimRight());
    const theirsLines = theirs.split(/\r?\n/).map((s) => s.trimRight());

    const mergedLines = [];
    // keep order: try to interleave if different; otherwise just append unique
    for (let i = 0; i < Math.max(oursLines.length, theirsLines.length); i++) {
      if (i < oursLines.length) mergedLines.push(oursLines[i]);
      if (i < theirsLines.length && theirsLines[i] !== (oursLines[i] || "")) {
        mergedLines.push(theirsLines[i]);
      }
    }
    // Fallback dedupe by set preserving order
    const seen = new Set();
    const dedupedMerged = mergedLines.filter((l) => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    });

    suggestions.push({
      conflictIndex: idx,
      ours: ours,
      theirs: theirs,
      merged: dedupedMerged.join("\n"),
      note: "Review merged version for semantic correctness; this is a naive merge combining non-duplicate lines.",
    });
  }

  if (suggestions.length === 0) {
    console.log("[info] No merge conflicts detected in file.");
    return { conflictCount: 0, suggestionsPath: null };
  }

  const outPath = `${conflictFile}.merge_suggestions.json`;
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        file: conflictFile,
        suggestions,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(
    `⚠️ Detected ${suggestions.length} conflict block(s) in ${conflictFile}`,
  );
  console.log(`Generated suggestions written to: ${outPath}`);
  console.log("Summary:");
  suggestions.forEach((s) => {
    console.log(
      `- Conflict #${s.conflictIndex}: suggested merged length ${s.merged.split(/\r?\n/).length} lines`,
    );
  });

  return { conflictCount: suggestions.length, suggestionsPath: outPath };
}

/**
 * Attempt auto-resolution of a conflict file by choosing a strategy.
 * Strategy: 'ours'|'theirs'|'merged'
 *
 * WARNING: This will overwrite the conflicted file locally. Use with caution.
 *
 * @param {string} conflictFile
 * @param {'ours'|'theirs'|'merged'} strategy
 */
function resolveMerge(conflictFile, strategy = "merged") {
  const suggestionFile = `${conflictFile}.merge_suggestions.json`;
  if (!fs.existsSync(suggestionFile)) {
    console.error(
      `[error] Suggestion file not found: ${suggestionFile}. Run suggest-merge first.`,
    );
    process.exit(1);
  }
  const raw = fs.readFileSync(suggestionFile, "utf-8");
  const obj = JSON.parse(raw);
  if (!obj || !obj.suggestions || obj.suggestions.length === 0) {
    console.error("[error] No suggestions present to resolve.");
    process.exit(1);
  }
  let content = fs.readFileSync(conflictFile, "utf-8");
  // Replace each conflict block sequentially using regex with appropriate candidate
  let i = 0;
  const newContent = content.replace(
    /<<<<<<<\s*(?:HEAD)?\s*[\r\n]([\s\S]*?)=======([\s\S]*?)>>>>>>>[^\r\n]*/g,
    function (_, ours, theirs) {
      const candidate = obj.suggestions[i];
      i += 1;
      if (!candidate) {
        // Should not happen
        return ours;
      }
      if (strategy === "ours") return candidate.ours;
      if (strategy === "theirs") return candidate.theirs;
      return candidate.merged;
    },
  );

  const backupPath = `${conflictFile}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, content, "utf-8");
  fs.writeFileSync(conflictFile, newContent, "utf-8");
  console.log(
    `✅ Conflict file ${conflictFile} resolved with strategy "${strategy}". Backup saved to ${backupPath}`,
  );
  console.log(
    "Please review the file and run `git add <file>` then `git commit` to finalize merge resolution.",
  );
}

/**
 * CLI entrypoint
 */
function printUsage() {
  console.log(`
Usage:
  node git_integration.js <command> [args] [--flags]

Commands:
  create-branch <feature|bugfix> <name> [base]
      Create and checkout a branch. Example: create-branch feature "Add Kanban"

  run-tests
      Run lint, unit, and integration tests.

  commit <message>
      Commit staged changes. If message omitted, an auto-generated conventional message will be used.

  auto-commit [--type <feat|fix|chore|test>] [--no-test] [--force]
      Stages all changes and commits. Runs tests by default unless --no-test.
      --force bypasses test failures.

  create-pr <base> <head> [--title "Title"] [--body "Body"] [--attach-comments path/to/comments.json]
      Create pull request. If --attach-comments provided, attach comments from JSON file.

  suggest-merge <conflict-file>
      Analyze a conflicted file and produce suggestions: writes <file>.merge_suggestions.json

  resolve-merge <conflict-file> <strategy>
      Auto-resolve conflicts using a strategy: ours|theirs|merged (requires previous suggest-merge run)

Examples:
  node git_integration.js create-branch feature "Add Kanban UI"
  node git_integration.js auto-commit --type feat
  node git_integration.js create-pr main feature/add-kanban --attach-comments ./reviews/comments.json
  node git_integration.js suggest-merge src/app.js
`);
}

/**
 * Very small CLI argument parser (positional + simple flags)
 */
function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = { command: null, positional: [], flags: {} };
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (!parsed.command) {
      parsed.command = a;
      i += 1;
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2);
      // boolean flags or key value
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        parsed.flags[key] = true;
        i += 1;
      } else {
        parsed.flags[key] = next;
        i += 2;
      }
      continue;
    }
    parsed.positional.push(a);
    i += 1;
  }
  return parsed;
}

// Expose functions for programmatic usage/tests
if (require.main === module) {
  (function main() {
    try {
      const parsed = parseArgs(process.argv);
      const cmd = parsed.command;
      if (!cmd) {
        printUsage();
        process.exit(0);
      }

      switch (cmd) {
        case "create-branch": {
          const [type, ...rest] = parsed.positional;
          const name = rest.join(" ") || parsed.flags.name;
          const base =
            parsed.positional[2] || parsed.flags.base || DEFAULTS.BASE_BRANCH;
          if (!type || !name) {
            console.error("[error] create-branch requires type and name");
            printUsage();
            process.exit(1);
          }
          createBranch(type, name, base);
          break;
        }
        case "run-tests": {
          runTests();
          break;
        }
        case "commit": {
          const message =
            parsed.positional.join(" ") ||
            parsed.flags.message ||
            parsed.flags.m;
          commitChanges(message, {
            noTest: parsed.flags["no-test"] || false,
            force: parsed.flags.force || false,
          });
          break;
        }
        case "auto-commit": {
          const message =
            parsed.flags.message ||
            parsed.flags.m ||
            parsed.positional.join(" ");
          const noTest = !!parsed.flags["no-test"];
          const force = !!parsed.flags.force;
          commitChanges(message, { noTest, force });
          break;
        }
        case "create-pr": {
          const [base, head] = parsed.positional;
          const title = parsed.flags.title;
          const body = parsed.flags.body;
          const attachCommentsPath =
            parsed.flags["attach-comments"] ||
            parsed.flags.attach_comments ||
            null;
          if (!base || !head) {
            console.error("[error] create-pr requires base and head");
            printUsage();
            process.exit(1);
          }
          createPullRequest(base, head, { title, body, attachCommentsPath });
          break;
        }
        case "suggest-merge": {
          const [file] = parsed.positional;
          if (!file) {
            console.error(
              "[error] suggest-merge requires a conflicted file path",
            );
            process.exit(1);
          }
          suggestMerge(file);
          break;
        }
        case "resolve-merge": {
          const [file, strategy] = parsed.positional;
          if (!file || !strategy) {
            console.error(
              "[error] resolve-merge requires file and strategy (ours|theirs|merged)",
            );
            process.exit(1);
          }
          resolveMerge(file, strategy);
          break;
        }
        default:
          console.error(`[error] Unknown command: ${cmd}`);
          printUsage();
          process.exit(1);
      }
    } catch (err) {
      console.error(
        "[fatal] Unhandled error:",
        err && err.message ? err.message : err,
      );
      process.exit(99);
    }
  })();
} else {
  // Export functions for tests or other scripts
  module.exports = {
    createBranch,
    runTests,
    generateCommitMessage,
    commitChanges,
    createPullRequest,
    attachReviewCommentsToPR,
    suggestMerge,
    resolveMerge,
    run,
    hasBinary,
  };
}
