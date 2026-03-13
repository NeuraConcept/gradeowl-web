import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Draft: Story = { args: { status: "DRAFT" } };
export const RubricReview: Story = { args: { status: "RUBRIC_REVIEW" } };
export const Grading: Story = { args: { status: "GRADING" } };
export const Clustering: Story = { args: { status: "CLUSTERING" } };
export const GradingFailed: Story = { args: { status: "GRADING_FAILED" } };
export const Complete: Story = { args: { status: "COMPLETE" } };
