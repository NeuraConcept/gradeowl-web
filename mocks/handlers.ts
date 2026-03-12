import { http, HttpResponse } from "msw";
import { createExam, createRubric, createSubmission, createGradingProgress, createAnalysisProgress } from "./data";

const API_BASE = "/api/proxy";

const mockExams = [
  createExam({ id: 1, title: "Math Unit Test 3", status: "COMPLETE" }),
  createExam({ id: 2, title: "Science Mid-term", status: "GRADING" }),
  createExam({ id: 3, title: "English Essay", status: "DRAFT" }),
];

export const handlers = [
  http.get(`${API_BASE}/exams`, () => {
    return HttpResponse.json(mockExams);
  }),
  http.get(`${API_BASE}/exams/:id`, ({ params }) => {
    const exam = mockExams.find((e) => e.id === Number(params.id));
    if (!exam) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(exam);
  }),
  http.post(`${API_BASE}/exams`, async ({ request }) => {
    const body = (await request.json()) as Partial<import("@/lib/api/types").CreateExamRequest>;
    const exam = createExam(body);
    return HttpResponse.json(exam, { status: 201 });
  }),
  http.get(`${API_BASE}/exams/:id/analysis-progress`, () => {
    return HttpResponse.json(createAnalysisProgress({ answers_done: 3, answers_pending: 2 }));
  }),
  http.get(`${API_BASE}/exams/:id/rubric`, () => {
    return HttpResponse.json([createRubric({ question_number: 1 }), createRubric({ question_number: 2 })]);
  }),
  http.get(`${API_BASE}/exams/:id/submissions`, () => {
    return HttpResponse.json([createSubmission(), createSubmission()]);
  }),
  http.get(`${API_BASE}/exams/:id/grading-progress`, () => {
    return HttpResponse.json(createGradingProgress({ done: 15, queued: 15, progress_pct: 50 }));
  }),
  http.post("/api/auth/token", () => {
    return HttpResponse.json({ access_token: "mock-jwt", refresh_token: "mock-refresh", token_type: "bearer" });
  }),
  http.post("/api/auth/refresh", () => {
    return HttpResponse.json({ access_token: "new-mock-jwt", refresh_token: "new-mock-refresh", token_type: "bearer" });
  }),
];
