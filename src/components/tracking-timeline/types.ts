// Generic types for the TrackingTimeline component
export type FilterType = "staff" | "customer" | "public";

export interface ITrackingEvent {
  object: string;
  id: number;
  visibility: "public" | "private";
  label: string | null;
  message: string | null;
  causer: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    gravatar?: string | null;
    shipping_mark?: string | null;
    type?: string | null;
  } | null;
  template: string | null;
  template_configuration: any | null;
  display_order: number;
  timeline_item?: {
    id: string | number;
    label: string;
    icon: string;
  };
  event_images: any;
  children: ITrackingEvent[];
  acls: any;
  mentions: any;
  created_at: string;
  updated_at: string;
}

export interface TimelineItem {
  id: string | number;
  label: string;
  icon: string;
}

export interface TrackingTimelineData {
  id: string | number;
  timelineItems?: TimelineItem[];
  trackingEvents: ITrackingEvent[];
}

export interface TrackingTimelineConfig {
  // Data fetching
  useTimelineData: (
    productId: string,
    filter: FilterType,
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
    event: ITrackingEvent;
    onReply?: (eventId: number, content: string) => Promise<void>;
  }>;

  SystemEventCard: React.ComponentType<{
    event: ITrackingEvent;
    isLast: boolean;
  }>;

  TimelineEventSkeleton: React.ComponentType<{
    count: number;
  }>;

  // Utils
  formatDateDisplay: (date: string) => string;
  extractMentions: (html: string) => number[];

  // Constants
  TrackingEventVisibilityEnum: {
    PUBLIC: string;
  };
}
