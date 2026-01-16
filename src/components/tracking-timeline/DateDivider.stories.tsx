import type { Meta, StoryObj } from "@storybook/react";
import { DateDivider } from "./DateDivider";

const meta = {
  title: "Components/TrackingTimeline/DateDivider",
  component: DateDivider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    date: {
      control: "text",
      description: "The date to display in the divider",
    },
    showExpandToggle: {
      control: "boolean",
      description: "Whether to show the expand/collapse toggle button",
    },
    isExpanded: {
      control: "boolean",
      description: "Whether the section is currently expanded",
    },
    onToggleExpand: {
      action: "toggled",
      description: "Callback when expand/collapse is clicked",
    },
  },
} satisfies Meta<typeof DateDivider>;

export default meta;
type Story = StoryObj<{
  render: () => React.ReactElement;
}>;

export const Default: Story = {
  args: {
    date: "Today",
    showExpandToggle: false,
    isExpanded: false,
  },
};

export const WithExpandToggle: Story = {
  args: {
    date: "Yesterday",
    showExpandToggle: true,
    isExpanded: false,
  },
};

export const Expanded: Story = {
  args: {
    date: "Yesterday",
    showExpandToggle: true,
    isExpanded: true,
  },
};

export const DifferentDates: Story = {
  render: () => (
    <div className="space-y-4">
      <DateDivider date="Today" />
      <DateDivider date="Yesterday" showExpandToggle />
      <DateDivider date="2 days ago" showExpandToggle isExpanded />
      <DateDivider date="January 15, 2024" />
    </div>
  ),
};
