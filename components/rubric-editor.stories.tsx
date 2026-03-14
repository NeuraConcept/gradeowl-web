import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { RubricEditor } from "./rubric-editor";
import type { Rubric } from "@/lib/api/types";

const baseRubric: Rubric = {
  id: 1,
  exam_id: 1,
  question_number: 1,
  max_marks: 5,
  criteria_json: [
    { description: "Correct formula used", marks: 2 },
    { description: "Proper working shown", marks: 2 },
    { description: "Final answer correct", marks: 1 },
  ],
  ai_generated: true,
  teacher_approved: false,
  created_at: "2026-03-01T10:00:00Z",
  updated_at: "2026-03-01T10:00:00Z",
};

const meta: Meta<typeof RubricEditor> = {
  title: "Components/RubricEditor",
  component: RubricEditor,
  args: {
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RubricEditor>;

export const Default: Story = {
  args: { rubric: baseRubric },
};

export const Approved: Story = {
  args: {
    rubric: { ...baseRubric, teacher_approved: true },
  },
};

export const MarksMismatch: Story = {
  args: {
    rubric: {
      ...baseRubric,
      max_marks: 10,
      criteria_json: [
        { description: "Correct formula used", marks: 2 },
        { description: "Proper working shown", marks: 2 },
        { description: "Final answer correct", marks: 1 },
      ],
    },
  },
};

export const EmptyCriteria: Story = {
  args: {
    rubric: {
      ...baseRubric,
      criteria_json: [],
      max_marks: 5,
    },
  },
};
