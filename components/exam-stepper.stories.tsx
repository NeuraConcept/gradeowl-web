import type { Meta, StoryObj } from "@storybook/react";
import { ExamStepper } from "./exam-stepper";

const meta: Meta<typeof ExamStepper> = {
  title: "Components/ExamStepper",
  component: ExamStepper,
  args: {
    examId: 1,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ExamStepper>;

export const AllLocked: Story = {
  args: {
    examStatus: "DRAFT",
    analysisComplete: false,
    rubricApproved: false,
    hasSubmissions: false,
  },
};

export const InProgress: Story = {
  args: {
    examId: 1,
    examStatus: "GRADING",
    analysisComplete: true,
    rubricApproved: true,
    hasSubmissions: true,
  },
};

export const RubricActive: Story = {
  args: {
    examStatus: "RUBRIC_REVIEW",
    analysisComplete: true,
    rubricApproved: false,
    hasSubmissions: false,
  },
};

export const SubmissionsActive: Story = {
  args: {
    examStatus: "RUBRIC_REVIEW",
    analysisComplete: true,
    rubricApproved: true,
    hasSubmissions: false,
  },
};

export const MidProgress: Story = {
  args: {
    examStatus: "GRADING",
    analysisComplete: true,
    rubricApproved: true,
    hasSubmissions: true,
  },
};

export const AllDone: Story = {
  args: {
    examStatus: "COMPLETE",
    analysisComplete: true,
    rubricApproved: true,
    hasSubmissions: true,
  },
};
