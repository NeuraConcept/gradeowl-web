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
  criteria: RubricCriterion[];
  ai_generated: boolean;
  teacher_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface RubricUpdate {
  question_number: number;
  max_marks: number;
  criteria: RubricCriterion[];
}

export interface SubmissionSummary {
  id: number;
  student_identifier: string;
  student_id: number | null;
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

export interface ClusterSampleAnswer {
  id: number;
  student_identifier: string | null;
  score: number;
  max_score: number;
  feedback: string;
  content_summary: string | null;
  transcription: string | null;
  /**
   * Original page image — either a signed `https://...` object-storage URL or an
   * absolute backend filesystem path (dev). Use `imagePathToProxyUrl` from
   * `@/lib/api/utils` before rendering in an `<img>`.
   */
  image_url: string | null;
}

export interface SubCluster {
  cluster_id: number;
  count: number;
  avg_score: number;
  sample_answers: ClusterSampleAnswer[];
}

export interface RubricPattern {
  label: string;
  criteria_met: string[];
  criteria_missed: string[];
}

export interface ClusterGroup {
  rubric_pattern: RubricPattern;
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
  /** Backend returns the field name `original` — same shape as cluster `image_url`. */
  original: string | null;
  /** Backend returns the field name `annotated` — null when overlay isn't generated yet. */
  annotated: string | null;
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

// Exam activity feed (collaborator-authorized mutation history)

export interface ExamActivity {
  id: number;
  actor_name: string;
  action: string;
  summary: string;
  created_at: string;
}

/** Aggregated from this exam's confirmed question-concept tags and graded work. */
export interface ConceptMasterySummary {
  concept_id: number;
  name: string;
  pct_correct: number;
  student_count: number;
}

export interface ConceptSummaryResponse {
  concepts: ConceptMasterySummary[];
}

export interface StudentConceptMastery {
  concept_id: number;
  name: string;
  pct_correct: number;
  root_cause?: Array<{
    concept_id: number;
    name: string;
    hop: number;
    confidence: number;
  }>;
}

export interface StudentMasteryResponse {
  student_id: number;
  concepts: StudentConceptMastery[];
}

export type MemberRole = "ADMIN" | "TEACHER";
export type AssignmentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Organization {
  id: number;
  name: string;
  email_domain: string | null;
  role: MemberRole;
  join_code: string | null;
  created_at: string;
  members: Array<{
    user_id: number;
    full_name: string | null;
    username: string;
    role: MemberRole;
  }>;
  sections: Array<{ id: number; class_name: string; label: string }>;
  my_assignments: Array<{
    id: number;
    class_name: string;
    subject: string;
    section_id: number | null;
    section_label: string | null;
    status: AssignmentStatus;
  }>;
}

// Admin dashboard types

export interface AdminDashboard {
  total_users: number;
  total_exams: number;
  total_submissions: number;
  total_graded: number;
  waitlist_count: number;
  exams_by_status: Record<string, number>;
  recent_exams: Array<{
    id: number;
    title: string;
    subject: string;
    class_name: string;
    status: string;
    teacher_name: string;
    created_at: string;
  }>;
}

export interface WaitlistEntry {
  id: number;
  name: string;
  school: string;
  phone: string;
  board: string;
  subjects: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  full_name: string;
  firebase_uid: string;
  created_at: string;
  exam_count: number;
}
