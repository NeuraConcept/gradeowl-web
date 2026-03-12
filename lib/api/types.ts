// Exam status enum matching backend ExamStatus
export type ExamStatus =
  | "DRAFT"
  | "RUBRIC_REVIEW"
  | "GRADING"
  | "CLUSTERING"
  | "GRADING_FAILED"
  | "COMPLETE";

export type SubmissionStatus = "UPLOADED" | "PROCESSING" | "GRADED" | "REVIEWED";
export type ProcessingStatus = "QUEUED" | "GRADING" | "OVERLAYING" | "DONE" | "FAILED";
export type AnalysisStatus = "PENDING" | "ANALYZING" | "DONE" | "FAILED" | "CANCELLED";
export type SourceType = "CAMERA" | "UPLOAD" | "PDF" | "TYPED";

export interface Exam {
  id: number;
  teacher_id: number;
  subject: string;
  class_name: string;
  title: string;
  total_marks: number;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
  qp_count?: number;
  ak_count?: number;
  rubric_count?: number;
}

export interface CreateExamRequest {
  subject: string;
  class_name: string;
  title: string;
  total_marks: number;
}

export interface UpdateExamRequest {
  subject?: string;
  class_name?: string;
  title?: string;
  total_marks?: number;
}

export interface QuestionPaperPage {
  id: number;
  exam_id: number;
  page_number: number;
  image_path: string;
  source_type: SourceType;
  typed_content: string | null;
  created_at: string;
}

export interface AnswerKeyPage {
  id: number;
  exam_id: number;
  page_number: number;
  image_path: string;
  source_type: SourceType;
  typed_content: string | null;
  created_at: string;
}

export interface QuestionMap {
  question_label: string;
  question_type: string;
  estimated_marks: number;
  qp_page_numbers: number[];
  ak_page_numbers: number[];
  answer_status: AnalysisStatus;
  reconciliation_status: AnalysisStatus;
  error: string | null;
}

export interface AnalysisProgress {
  total_questions: number;
  answers_done: number;
  answers_failed: number;
  answers_analyzing: number;
  answers_pending: number;
  reconciliation_total: number;
  reconciliation_done: number;
  reconciliation_failed: number;
  reconciliation_analyzing: number;
  reconciliation_pending: number;
  questions: QuestionMap[];
}

export interface RubricCriterion {
  description: string;
  marks: number;
}

export interface Rubric {
  id: number;
  exam_id: number;
  question_number: number;
  max_marks: number;
  criteria_json: RubricCriterion[];
  ai_generated: boolean;
  teacher_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface RubricUpdate {
  question_number: number;
  max_marks: number;
  criteria_json: RubricCriterion[];
}

export interface SubmissionSummary {
  id: number;
  student_identifier: string;
  status: SubmissionStatus;
  total_score: number | null;
  page_count: number;
  created_at: string;
}

export interface GradingResult {
  id: number;
  submission_page_id: number;
  question_number: number;
  score: number;
  max_score: number;
  feedback: string;
  content_summary: string;
  transcription: string;
  cluster_id: number | null;
  teacher_adjusted_score: number | null;
  teacher_notes: string | null;
  effective_score: number;
}

export interface SubmissionPage {
  id: number;
  submission_id: number;
  page_number: number;
  original_image_path: string;
  annotated_image_path: string | null;
  processing_status: ProcessingStatus;
  created_at: string;
}

export interface SubmissionDetail {
  id: number;
  student_identifier: string;
  status: SubmissionStatus;
  total_score: number | null;
  pages: SubmissionPage[];
  grading_results: GradingResult[];
}

export interface GradingProgress {
  exam_status: ExamStatus;
  total_pages: number;
  done: number;
  failed: number;
  in_progress: number;
  queued: number;
  progress_pct: number;
}

export interface SubCluster {
  cluster_id: number;
  count: number;
  avg_score: number;
  sample_answers: Array<{
    student_identifier: string;
    feedback: string;
    score: number;
  }>;
}

export interface ClusterGroup {
  rubric_pattern: string;
  total_count: number;
  avg_score: number;
  sub_clusters: SubCluster[];
}

export interface ClusterResponse {
  clusters: ClusterGroup[];
  total_questions: number;
}

export interface StudentResult {
  student_identifier: string;
  total_score: number;
  max_possible: number;
  status: SubmissionStatus;
  questions: Array<{
    question_number: number;
    score: number;
    max_score: number;
    effective_score: number;
  }>;
}

export interface ResultsSummary {
  total_students: number;
  avg_score: number;
  max_score: number;
  min_score: number;
}

export interface ResultsResponse {
  exam: Exam;
  results: StudentResult[];
  summary: ResultsSummary;
}

export interface QuestionAnalytics {
  question_number: number;
  max_marks: number;
  avg_score: number;
  attempts: number;
  above_80_pct: number;
  below_40_pct: number;
}

export interface AnalyticsResponse {
  questions: QuestionAnalytics[];
  overall: {
    total_students: number;
    avg_percentage: number;
    pass_count: number;
    fail_count: number;
  };
}

export interface AnnotatedPage {
  page_number: number;
  original_url: string;
  annotated_url: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface StudentIdExtraction {
  student_name: string | null;
  roll_number: string | null;
  class_section: string | null;
  confidence: "high" | "medium" | "low";
  suggested_identifier: string;
}
