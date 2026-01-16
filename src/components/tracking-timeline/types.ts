// Generic types for the TrackingTimeline component
export type FilterType = "staff" | "customer" | "public";

export interface TrackingEvent {
  id: string | number;
  content?: string;
  label?: string | null;
  createdAt: string;
  timelineItem?: {
    id: string | number;
    label: string;
    icon: string;
  };
}

export interface TimelineItem {
  id: string | number;
  label: string;
  icon: string;
}

export interface TrackingTimelineData {
  id: string | number;
  timelineItems?: TimelineItem[];
  trackingEvents: TrackingEvent[];
}

export interface TrackingTimelineConfig {
  // Data fetching
  useTimelineData: (
    productId: string,
    filter: FilterType
  ) => {
    data: TrackingTimelineData | null;
    isLoading: boolean;
    error: any;
  };

  // UI Components
  RichTextEditor: React.ComponentType<{
    onSubmit: (html: string) => Promise<void>;
    isSubmitting: boolean;
    onVisibilityChange: (filter: FilterType) => void;
    visibility: FilterType;
  }>;

  VisibilityFilter: React.ComponentType<{
    buyProductId: string;
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
  }>;

  UserEventCard: React.ComponentType<{
    event: TrackingEvent;
  }>;

  SystemEventCard: React.ComponentType<{
    event: TrackingEvent;
    isLast: boolean;
  }>;

  TimelineEventSkeleton: React.ComponentType<{
    count: number;
  }>;

  // Utils
  formatDateDisplay: (date: string) => string;
  extractMentions: (html: string) => string[];

  // Constants
  TrackingEventVisibilityEnum: {
    PUBLIC: string;
  };
}
