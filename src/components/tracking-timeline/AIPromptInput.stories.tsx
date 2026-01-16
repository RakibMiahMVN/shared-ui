import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AIPromptInput } from "./AIPromptInput";

const meta = {
  title: "Components/TrackingTimeline/AIPromptInput",
  component: AIPromptInput,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    isVisible: {
      control: "boolean",
      description: "Whether the AI prompt input is visible",
    },
    isGenerating: {
      control: "boolean",
      description: "Whether content is currently being generated",
    },
    selectedChannels: {
      control: "object",
      description: "Array of selected communication channels",
    },
    onClose: {
      action: "closed",
      description: "Callback when close button is clicked",
    },
    onGenerate: {
      action: "generated",
      description: "Callback when content is generated",
    },
  },
} satisfies Meta<typeof AIPromptInput>;

export default meta;
type Story = StoryObj<{
  render: () => React.ReactElement;
}>;

const AIPromptInputWrapper = (args: any) => {
  const [isVisible, setIsVisible] = useState(args.isVisible);

  const handleGenerate = async (prompt: string) => {
    console.log("Generating content:", prompt);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    args.onGenerate(prompt);
  };

  const handleClose = () => {
    setIsVisible(false);
    args.onClose();
  };

  return (
    <div>
      <button
        onClick={() => setIsVisible(true)}
        className="mb-4 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
      >
        Open AI Assistant
      </button>
      <AIPromptInput
        {...args}
        isVisible={isVisible}
        onClose={handleClose}
        onGenerate={handleGenerate}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <AIPromptInputWrapper
      isVisible={false}
      isGenerating={false}
      selectedChannels={["email"]}
    />
  ),
};

export const MultipleChannels: Story = {
  render: () => (
    <AIPromptInputWrapper
      isVisible={false}
      isGenerating={false}
      selectedChannels={["email", "SMS"]}
    />
  ),
};

export const Generating: Story = {
  render: () => (
    <AIPromptInput
      isVisible={true}
      isGenerating={true}
      selectedChannels={["email"]}
      onClose={() => {}}
      onGenerate={() => Promise.resolve()}
    />
  ),
};

export const WithLongPrompt: Story = {
  render: () => {
    return (
      <AIPromptInput
        isVisible={true}
        isGenerating={false}
        selectedChannels={["email"]}
        onClose={() => {}}
        onGenerate={() => Promise.resolve()}
      />
    );
  },
};
