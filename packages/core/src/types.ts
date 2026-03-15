/**
 * 하네스 시스템 핵심 타입 정의
 */

// ─── Audit ───

export interface AuditCheck {
  id: string;
  category: AuditCategory;
  name: string;
  description: string;
  pass: boolean;
  severity: "critical" | "important" | "nice-to-have";
  details?: string;
  fix?: string;
}

export type AuditCategory =
  | "context"       // AGENTS.md, CLAUDE.md
  | "workflow"      // specs/, tasks/
  | "constraints"   // 아키텍처 제약, lint
  | "eval"          // eval 데이터셋
  | "conventions"   // 코딩 컨벤션
  | "build"         // 빌드/테스트 명령어
  | "docs";         // 문서

export interface AuditReport {
  projectPath: string;
  timestamp: string;
  score: number;           // 0-100
  grade: string;           // A, B, C, D, F
  checks: AuditCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    byCritical: { passed: number; total: number };
    byCategory: Record<AuditCategory, { passed: number; total: number }>;
  };
}

// ─── Recommend ───

export interface Recommendation {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  effort: "small" | "medium" | "large";
  template?: string;       // 자동 생성 가능한 템플릿 이름
  targetPath?: string;     // 생성할 파일 경로
}

// ─── Preset ───

export type PresetName = "minimal" | "standard";

export interface HarnessConfig {
  preset?: PresetName;
  checks?: {
    enable?: string[];
    disable?: string[];
  };
  severity?: Record<string, "critical" | "important" | "nice-to-have">;
}

// ─── Init ───

export interface InitOptions {
  projectName?: string;
  preset?: PresetName;
  skipWorkflow?: boolean;
  force?: boolean;
}

export interface InitResult {
  created: string[];
  skipped: string[];
  message: string;
}
