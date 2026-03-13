import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ExamCard } from "./exam-card";
import type { Exam } from "@/lib/api/types";

const baseExam: Exam = {
  id: 1,
  teacher_id: 100,
  subject: "Mathematics",
  class_name: "Class 10-A",
  title: "Mid-Term Algebra Exam",
  total_marks: 50,
  status: "DRAFT",
  created_at: "2026-03-01T10:00:00Z",
  updated_at: "2026-03-01T10:00:00Z",
};

const meta: Meta<typeof ExamCard> = {
  title: "Components/ExamCard",
  component: ExamCard,
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ExamCard>;

export const Default: Story = {
  args: { exam: baseExam },
};

export const DraftWithMenu: Story = {
  args: { exam: { ...baseExam, status: "DRAFT" } },
};

export const Complete: Story = {
  args: { exam: { ...baseExam, status: "COMPLETE", title: "Final Science Exam" } },
};

export const RubricReview: Story = {
  args: { exam: { ...baseExam, status: "RUBRIC_REVIEW", title: "History Essay Exam" } },
};

export const Grading: Story = {
  args: { exam: { ...baseExam, status: "GRADING", title: "Physics Practical" } },
};
