/**
 * 하네스 프리셋 정의
 *
 * minimal: 최소한의 하네스 (AGENTS.md + 빌드 명령어)
 * standard: 표준 하네스 (전체 체크)
 */

import type { HarnessConfig, PresetName } from "./types.js";

const MINIMAL_CONFIG: HarnessConfig = {
  preset: "minimal",
  checks: {
    disable: [
      "wf-specs-dir",
      "wf-tasks-dir",
      "cst-precommit",
      "eval-dir",
      "conv-editorconfig",
      "build-ci",
    ],
  },
};

const STANDARD_CONFIG: HarnessConfig = {
  preset: "standard",
  // 모든 체크 활성화 (기본값)
};

const PRESETS: Record<PresetName, HarnessConfig> = {
  minimal: MINIMAL_CONFIG,
  standard: STANDARD_CONFIG,
};

/** 프리셋 이름으로 설정 가져오기 */
export function getPreset(name: PresetName): HarnessConfig {
  return PRESETS[name];
}

/** .harness.json 파일과 프리셋을 병합 */
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

/** 체크 ID가 config에 의해 비활성화되었는지 확인 */
export function isCheckDisabled(checkId: string, config: HarnessConfig): boolean {
  if (config.checks?.enable?.length) {
    return !config.checks.enable.includes(checkId);
  }
  return config.checks?.disable?.includes(checkId) ?? false;
}

/** 심각도 오버라이드 */
export function getSeverity(
  checkId: string,
  defaultSeverity: "critical" | "important" | "nice-to-have",
  config: HarnessConfig,
): "critical" | "important" | "nice-to-have" {
  return config.severity?.[checkId] ?? defaultSeverity;
}
