import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { DropZone } from "./drop-zone";

const meta: Meta<typeof DropZone> = {
  title: "Components/DropZone",
  component: DropZone,
  args: {
    onFiles: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DropZone>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: { label: "Upload question paper images" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
