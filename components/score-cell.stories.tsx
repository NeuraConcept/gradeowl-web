import type { Meta, StoryObj } from "@storybook/react";
import { ScoreCell } from "./score-cell";

const meta: Meta<typeof ScoreCell> = {
  title: "Components/ScoreCell",
  component: ScoreCell,
};

export default meta;
type Story = StoryObj<typeof ScoreCell>;

export const High: Story = {
  args: { score: 9, maxScore: 10 },
};

export const Medium: Story = {
  args: { score: 5, maxScore: 10 },
};

export const Low: Story = {
  args: { score: 2, maxScore: 10 },
};

export const Perfect: Story = {
  args: { score: 10, maxScore: 10 },
};

export const Zero: Story = {
  args: { score: 0, maxScore: 10 },
};
