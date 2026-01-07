import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { JsDiffResult } from "@archlinter/core";

export interface RunOptions {
  baseline: string;
  failOn: string;
  workingDirectory: string;
}

export async function runArchlintDiff(
  options: RunOptions,
): Promise<JsDiffResult> {
  let stdout = "";
  let stderr = "";

  const args = [
    "diff",
    options.baseline,
    "--fail-on",
    options.failOn,
    "--explain",
    "--json",
  ];

  try {
    await ensureRefExists(options.baseline, options.workingDirectory);

    await exec.exec("npx", ["@archlinter/cli", ...args], {
      cwd: options.workingDirectory,
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
        },
      },
      ignoreReturnCode: true, // We handle failure based on the JSON result or exit code manually
    });

    // Try to find JSON in stdout (in case there are other logs)
    const jsonStart = stdout.indexOf("{");
    const jsonEnd = stdout.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(
        `Failed to parse archlint output. Raw output:\n${stdout}\n${stderr}`,
      );
    }

    const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonStr) as JsDiffResult;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Archlint execution failed: ${error.message}`);
    }
    throw error;
  }
}

async function ensureRefExists(ref: string, cwd: string): Promise<void> {
  // If it's a file path, we don't need to do anything
  if (ref.endsWith(".json")) return;

  try {
    // Check if ref exists locally
    await exec.exec("git", ["rev-parse", "--verify", ref], {
      cwd,
      silent: true,
      listeners: {
        stderr: () => {}, // Suppress error output
      },
    });
    core.debug(`Ref "${ref}" already exists locally.`);
  } catch (error) {
    core.info(`Ref "${ref}" not found locally. Attempting to fetch...`);

    try {
      if (ref.includes("/")) {
        const [remote, ...branchParts] = ref.split("/");
        const branch = branchParts.join("/");

        // Fetch specific branch from remote
        await exec.exec(
          "git",
          [
            "fetch",
            "--no-tags",
            "--prune",
            "--depth=1",
            remote,
            `+refs/heads/${branch}:refs/remotes/${remote}/${branch}`,
          ],
          {
            cwd,
            ignoreReturnCode: true,
          },
        );
      } else {
        // Try to fetch from origin as a fallback
        await exec.exec(
          "git",
          [
            "fetch",
            "--no-tags",
            "--prune",
            "--depth=1",
            "origin",
            `+refs/heads/${ref}:refs/remotes/origin/${ref}`,
          ],
          {
            cwd,
            ignoreReturnCode: true,
          },
        );
      }
    } catch (fetchError) {
      core.warning(
        `Failed to fetch ref "${ref}": ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      );
    }
  }
}
