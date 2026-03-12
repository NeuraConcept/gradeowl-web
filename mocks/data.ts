import type { Exam, Rubric, SubmissionSummary, GradingProgress, AnalysisProgress } from "@/lib/api/types";

let nextId = 1;

export function resetIdCounter() {
  nextId = 1;
}

export function createExam(overrides: Partial<Exam> = {}): Exam {
  const id = nextId++;
  return {
    id,
    teacher_id: 1,
    subject: "Mathematics",
    class_name: "Class 10-A",
    title: "Unit Test 3",
    total_marks: 50,
    status: "DRAFT",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createRubric(overrides: Partial<Rubric> = {}): Rubric {
  const id = nextId++;
  return {
    id,
    exam_id: 1,
    question_number: 1,
    max_marks: 10,
    criteria_json: [
      { description: "Correct formula", marks: 5 },
      { description: "Correct answer", marks: 5 },
    ],
    ai_generated: true,
    teacher_approved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createSubmission(overrides: Partial<SubmissionSummary> = {}): SubmissionSummary {
  const id = nextId++;
  return {
    id,
    student_identifier: `Student ${id}`,
    status: "UPLOADED",
    total_score: null,
    page_count: 3,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createGradingProgress(overrides: Partial<GradingProgress> = {}): GradingProgress {
  return {
    exam_status: "GRADING",
    total_pages: 30,
    done: 0,
    failed: 0,
    in_progress: 0,
    queued: 30,
    progress_pct: 0,
    ...overrides,
  };
}

export function createAnalysisProgress(overrides: Partial<AnalysisProgress> = {}): AnalysisProgress {
  return {
    total_questions: 5,
    answers_done: 0,
    answers_failed: 0,
    answers_analyzing: 0,
    answers_pending: 5,
    reconciliation_total: 0,
    reconciliation_done: 0,
    reconciliation_failed: 0,
    reconciliation_analyzing: 0,
    reconciliation_pending: 0,
    questions: [],
    ...overrides,
  };
}
