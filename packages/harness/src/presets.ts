/**
 * Harness preset definitions
 *
 * minimal: Minimal harness (AGENTS.md + build commands)
 * standard: Standard harness (all checks enabled)
 */

import type { HarnessConfig, PresetName } from "./types.js";

const MINIMAL_CONFIG: HarnessConfig = {
  preset: "minimal",
  checks: {
    disable: [
      "ctx-agents-concise",
      "ctx-agents-security",
      "ctx-agents-links-docs",
      "ctx-sub-agents",
      "ctx-claude-exists",
      "cst-precommit",
      "cst-arch-enforcement",
      "eval-ci-lint",
      "eval-dataset",
      "ent-tech-debt",
      "ent-docs-in-repo",
      "saf-security-doc",
      "know-adrs",
      "wf-specs-dir",
      "wf-tasks-dir",
    ],
  },
};

const STANDARD_CONFIG: HarnessConfig = {
  preset: "standard",
  // All checks enabled (default)
};

const PRESETS: Record<PresetName, HarnessConfig> = {
  minimal: MINIMAL_CONFIG,
  standard: STANDARD_CONFIG,
};

/** Get configuration by preset name */
export function getPreset(name: PresetName): HarnessConfig {
  return PRESETS[name];
}

/** Merge a .harness.json file with a preset */
export function mergeConfig(
  base: HarnessConfig,
  override: Partial<HarnessConfig>,
): HarnessConfig {
  return {
    preset: override.preset ?? base.preset,
    checks: {
      enable: [
        ...(base.checks?.enable ?? []),
        ...(override.checks?.enable ?? []),
      ],
      disable: [
        ...(base.checks?.disable ?? []),
        ...(override.checks?.disable ?? []),
      ],
    },
    severity: {
      ...(base.severity ?? {}),
      ...(override.severity ?? {}),
    },
  };
}

/** Check whether a check ID is disabled by the config */
export function isCheckDisabled(
  checkId: string,
  config: HarnessConfig,
): boolean {
  if (config.checks?.enable?.length) {
    return !config.checks.enable.includes(checkId);
  }
  return config.checks?.disable?.includes(checkId) ?? false;
}

/** Override severity for a check */
export function getSeverity(
  checkId: string,
  defaultSeverity: "critical" | "important" | "nice-to-have",
  config: HarnessConfig,
): "critical" | "important" | "nice-to-have" {
  return config.severity?.[checkId] ?? defaultSeverity;
}
