// Generic types for the TrackingTimeline component
export type FilterType = "staff" | "customer" | "public";

import { TrackingEventModel } from "../../models/trackingEventCollectionModel";

export interface ICommonUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gravatar?: string | null;
  shipping_mark?: string | null;
  type?: string | null;
}

export interface ITemplateConfigurationValueItem {
  type: string;
  value: string;
}

export interface ITemplateConfigurationActionItem {
  on: string;
  name: string;
  label: string | null;
  target: string;
}

export interface ITemplateConfigurationValues {
  object: string;
  data: Record<string, ITemplateConfigurationValueItem>;
}

export interface ITemplateConfigurationActions {
  object: string;
  data: ITemplateConfigurationActionItem[] | ITemplateConfigurationActionItem;
}

export interface ITemplateConfiguration {
  values: ITemplateConfigurationValues;
  actions: ITemplateConfigurationActions;
}

export interface IRoleTrackingEventAclValue {
  object: string;
  id: number;
  name: string;
  label: string | null;
}

export interface IBaseTrackingEventAcl {
  object: string;
  id: number;
  acl_type: "role" | "user";
}

export interface IRoleTrackingEventAcl extends IBaseTrackingEventAcl {
  acl_type: "role";
  acl_value: IRoleTrackingEventAclValue;
}

export interface ICustomerTrackingEventAclValue {
  object: string;
  id: number;
  name: string;
  phone: string | null;
  email: string;
  type: string;
}

export interface ICustomerTrackingEventAcl extends IBaseTrackingEventAcl {
  acl_type: "user";
  acl_value: ICustomerTrackingEventAclValue;
}

export interface ITrackingEventAclCollection {
  object: string;
  data: (IRoleTrackingEventAcl | ICustomerTrackingEventAcl)[];
}

export interface ITrackingEventMentionUser {
  object: string;
  id: number;
  name: string;
  phone: string | null;
  email: string;
  type: string;
}

export interface ITrackingEventMention {
  object: string;
  id: number;
  user: ITrackingEventMentionUser;
}

export interface ITrackingEventMentionCollection {
  object: string;
  data: ITrackingEventMention[];
}

export interface ITrackingEventImage {
  id: number;
  url: string;
  thumbnail_url?: string;
}

export interface ITrackingEventImageCollection {
  object: string;
  data: ITrackingEventImage[];
}

export interface ITrackingTimelineItem {
  object: string;
  id: number;
  label: string;
  identifier: string;
  description: string | null;
  icon: string;
  display_order: number;
  created_at: string;
}

export interface ITrackingEvent {
  object: string;
  id: number;
  visibility: "public" | "private";
  label: string | null;
  message: string | null;
  causer: ICommonUser | null;
  template: string | null;
  template_configuration: ITemplateConfiguration | null;
  display_order: number;
  timeline_item?: ITrackingTimelineItem;
  event_images: ITrackingEventImageCollection;
  children: ITrackingEvent[];
  acls: ITrackingEventAclCollection;
  mentions: ITrackingEventMentionCollection;
  created_at: string;
  updated_at: string;
  is_edited?: boolean;
}

export interface ITrackingTimelineItemCollection {
  object: string;
  data: ITrackingTimelineItem[];
}

export interface ITrackingTimeline {
  object: string;
  id: number;
  timeline_items: ITrackingTimelineItemCollection;
}

export interface ITrackingEventCollection {
  object: string;
  data: ITrackingEvent[];
}

export interface ITracker {
  object: string;
  id: number;
  track_for: string;
  timeline?: ITrackingTimeline;
  tracking_events: ITrackingEventCollection;
}

export interface ITimelineTracking {
  data?: ITracker;
}

export interface TrackingTimelineConfig {
  // Data fetching
  useTimelineData: (
    productId: string,
    filter: FilterType,
  ) => {
    data: ITracker | null;
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
    event: TrackingEventModel;
    onReply?: (eventId: number, content: string) => Promise<void>;
  }>;

  SystemEventCard: React.ComponentType<{
    event: TrackingEventModel;
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
