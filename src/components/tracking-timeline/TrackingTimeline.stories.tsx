import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import TrackingTimeline from "./TrackingTimeline";
import { TrackingTimelineProvider } from "./TrackingTimelineProvider";
import { FilterType, TrackingTimelineConfig } from "./types";

// Mock components for demo
const MockRichTextEditor = ({
  onSubmit,
  isSubmitting,
  onVisibilityChange,
  visibility,
}: any) => (
  <div className="border rounded p-4 bg-gray-50">
    <div className="text-sm text-gray-600 mb-2">Rich Text Editor (Mock)</div>
    <textarea
      className="w-full p-2 border rounded"
      placeholder="Type a comment..."
      disabled={isSubmitting}
    />
    <div className="flex justify-between mt-2">
      <select
        value={visibility}
        onChange={(e) => onVisibilityChange(e.target.value as FilterType)}
        className="text-sm border rounded px-2 py-1"
      >
        <option value="staff">Staff</option>
        <option value="customer">Customer</option>
        <option value="public">Public</option>
      </select>
      <button
        onClick={() => onSubmit("Mock comment submitted")}
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  </div>
);

const MockVisibilityFilter = ({ activeFilter, onFilterChange }: any) => (
  <div className="flex gap-2">
    <div className="text-sm text-gray-600">Filter:</div>
    {(["staff", "customer", "public"] as FilterType[]).map((filter) => (
      <button
        key={filter}
        onClick={() => onFilterChange(filter)}
        className={`px-3 py-1 rounded text-sm ${
          activeFilter === filter
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {filter}
      </button>
    ))}
  </div>
);

const MockUserEventCard = ({ event }: any) => (
  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
    <div className="text-sm font-medium">User Event</div>
    <div className="text-sm text-gray-600">{event.content}</div>
    <div className="text-xs text-gray-400">{event.createdAt}</div>
  </div>
);

const MockSystemEventCard = ({ event }: any) => (
  <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
    <div className="text-sm font-medium">System Event</div>
    <div className="text-sm text-gray-600">{event.content}</div>
    <div className="text-xs text-gray-400">{event.createdAt}</div>
  </div>
);

const MockTimelineEventSkeleton = ({ count }: any) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Mock data hook
const useMockTimelineData = (_productId: string, _filter: FilterType) => {
  const mockData = {
    id: "123",
    timelineItems: [
      { id: "1", label: "Order Placed", icon: "📦" },
      { id: "2", label: "Payment Confirmed", icon: "💳" },
      { id: "3", label: "Shipped", icon: "🚚" },
    ],
    trackingEvents: [
      {
        id: "1",
        content: "Order has been placed successfully",
        label: "Order Placed",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        timelineItem: { id: "1", label: "Order Placed", icon: "📦" },
      },
      {
        id: "2",
        content: "Payment has been confirmed",
        label: "Payment Confirmed",
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        timelineItem: { id: "2", label: "Payment Confirmed", icon: "💳" },
      },
      {
        id: "3",
        content: "Package has been shipped",
        label: "Shipped",
        createdAt: new Date().toISOString(),
        timelineItem: { id: "3", label: "Shipped", icon: "🚚" },
      },
    ],
  };

  return {
    data: mockData,
    isLoading: false,
    error: null,
  };
};

const mockConfig: TrackingTimelineConfig = {
  useTimelineData: useMockTimelineData,
  RichTextEditor: MockRichTextEditor,
  VisibilityFilter: MockVisibilityFilter,
  UserEventCard: MockUserEventCard,
  SystemEventCard: MockSystemEventCard,
  TimelineEventSkeleton: MockTimelineEventSkeleton,
  formatDateDisplay: (date: string) => new Date(date).toLocaleDateString(),
  extractMentions: (_html: string) => [],
  TrackingEventVisibilityEnum: { PUBLIC: "public" },
};

const trackingTimelineMeta = {
  title: "Components/TrackingTimeline/TrackingTimeline",
  component: "TrackingTimeline" as any,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<any>;

export default trackingTimelineMeta;
type Story = StoryObj<{
  render: () => React.ReactElement;
}>;

const TrackingTimelineWrapper = (args: any) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("staff");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const handleAddComment = async (html: string) => {
    console.log("Adding comment:", html);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <TrackingTimelineProvider
      onAddComment={handleAddComment}
      isSubmittingComment={false}
    >
      <TrackingTimeline
        {...args}
        config={mockConfig}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
        onAddComment={handleAddComment}
        isSubmittingComment={false}
      />
    </TrackingTimelineProvider>
  );
};

export const Default: Story = {
  render: (args) => <TrackingTimelineWrapper {...args} />,
};

export const CustomerView: Story = {
  render: () => {
    const [activeFilter, setActiveFilter] = useState<FilterType>("customer");
    const [expandedGroups, setExpandedGroups] = useState<
      Record<string, boolean>
    >({});

    const handleAddComment = async (html: string) => {
      console.log("Adding comment:", html);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
      <TrackingTimelineProvider
        onAddComment={handleAddComment}
        isSubmittingComment={false}
      >
        <TrackingTimeline
          productId="123"
          productType="purchase"
          config={mockConfig}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
          onAddComment={handleAddComment}
          isSubmittingComment={false}
        />
      </TrackingTimelineProvider>
    );
  },
};
