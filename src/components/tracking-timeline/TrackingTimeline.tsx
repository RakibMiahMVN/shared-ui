import React from "react";
import { TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { DateDivider } from "./DateDivider";
import { FilterType, TrackingTimelineConfig } from "./types";
import { TrackerModel } from "../../models/trackingEventCollectionModel";

interface TrackingTimelineProps {
  productId: string;
  productType?: "shipment" | "purchase";
  buyProductId?: string;
  className?: string;
  config: TrackingTimelineConfig;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  expandedGroups: Record<string, boolean>;
  setExpandedGroups: (groups: Record<string, boolean>) => void;
  onAddComment: (html: string) => Promise<void>;
  isSubmittingComment: boolean;
  commentError?: any;
  onReply?: (eventId: number, content: string) => Promise<void>;
}

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  productId,
  productType = "purchase",
  buyProductId,
  className: _className = "",
  config,
  activeFilter,
  setActiveFilter,
  expandedGroups,
  setExpandedGroups,
  onAddComment,
  isSubmittingComment,
  commentError,
  onReply,
}) => {
  const {
    useTimelineData,
    RichTextEditor,
    VisibilityFilter,
    UserEventCard,
    SystemEventCard,
    TimelineEventSkeleton,
    formatDateDisplay,
  } = config;

  const {
    data: tracker,
    isLoading,
    error,
  } = useTimelineData(productId, activeFilter);

  const Tracker = tracker && new TrackerModel(tracker);

  const trackingEvents = Tracker?.getTrackingEvents().getData() || [];
  const timelineItems = Tracker?.getTimeline()?.getTimelineItems();

  // Group events based on active filter
  let groupedEvents: Record<string, typeof trackingEvents> = {};
  let isCustomerView = activeFilter === "customer";

  if (isCustomerView && timelineItems) {
    // Group by timeline item for customer view
    timelineItems.forEach((timelineItem) => {
      const itemId = timelineItem.id.toString();
      groupedEvents[itemId] = trackingEvents
        .filter(
          (event) => event.getTimelineItem()?.getId() === timelineItem.getId(),
        )
        .sort(
          (a, b) =>
            new Date(b.getCreatedAt()).getTime() -
            new Date(a.getCreatedAt()).getTime(),
        );
    });
  } else {
    // Group by date for staff/public views
    const sortedEvents = [...trackingEvents].sort(
      (a, b) =>
        new Date(b.getCreatedAt()).getTime() -
        new Date(a.getCreatedAt()).getTime(),
    );
    groupedEvents = sortedEvents.reduce(
      (groups, event) => {
        const date = new Date(event.getCreatedAt()).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(event);
        return groups;
      },
      {} as Record<string, typeof trackingEvents>,
    );
  }

  // Toggle expand/collapse for individual groups
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups({
      ...expandedGroups,
      [groupKey]: !expandedGroups[groupKey],
    });
  };

  // Toggle expand/collapse for all groups
  const toggleAllGroups = () => {
    const groupsWithEvents = Object.keys(groupedEvents).filter(
      (key) => groupedEvents[key].length > 0,
    );
    const allExpanded = groupsWithEvents.every((key) => expandedGroups[key]);
    const newState = groupsWithEvents.reduce(
      (acc, key) => {
        acc[key] = !allExpanded;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setExpandedGroups(newState);
  };

  // Check if all groups are expanded
  const allExpanded = Object.keys(groupedEvents)
    .filter((key) => groupedEvents[key].length > 0)
    .every((key) => expandedGroups[key]);

  const handleAddComment = async (html: string) => {
    if (!html.trim()) return;
    await onAddComment(html);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-4 rounded border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#008060]" />
                <h1 className="text-lg text-[#212B36]">
                  {isCustomerView
                    ? `${
                        productType === "shipment" ? "Shipment" : "Purchase"
                      } Status`
                    : `${
                        productType === "shipment" ? "Shipment" : "Purchase"
                      } Activity`}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              <span className="text-sm text-[#637381]">Active</span>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="mb-4">
          <RichTextEditor
            onSubmit={handleAddComment}
            isSubmitting={isSubmittingComment}
            onVisibilityChange={setActiveFilter}
            visibility={activeFilter}
          />
          {commentError && (
            <p className="mt-2 text-sm text-red-600">
              Failed to add comment. Please try again.
            </p>
          )}
        </div>

        {/* Visibility Filter */}
        <div className="mb-4">
          <VisibilityFilter
            buyProductId={buyProductId || productId}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Global Expand/Collapse Toggle */}
        {Object.keys(groupedEvents).filter(
          (key) => groupedEvents[key].length > 0,
        ).length > 1 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={toggleAllGroups}
              className="flex items-center gap-1.5 text-sm text-[#637381] transition-colors hover:text-[#008060]"
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>
                    Collapse all {isCustomerView ? "groups" : "dates"}
                  </span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Expand all {isCustomerView ? "groups" : "dates"}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Timeline Events Section */}
        <div className="rounded border border-[#E5E7EB] bg-white p-4">
          {isLoading ? (
            <div className="py-8">
              <TimelineEventSkeleton count={4} />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-red-600">
                Failed to load timeline events. This product may not have any
                event tracked yet for {activeFilter}.
              </div>
            </div>
          ) : Object.values(groupedEvents).flat().length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-4 text-4xl text-gray-300">📋</div>
                <div className="mb-2 text-sm text-[#637381]">
                  {isCustomerView
                    ? "No customer-visible events found"
                    : "No timeline events found"}
                </div>
                <div className="max-w-md text-xs text-[#9CA3AF]">
                  {isCustomerView
                    ? "Events may be marked as staff-only or no customer-visible events have been recorded yet."
                    : "This product may not have any events tracked yet, or events may be filtered by the current view."}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([groupKey, events]) => {
                if (events.length === 0) return null;

                return (
                  <div key={groupKey} className="space-y-3">
                    {/* Group Header - different for customer vs staff/public */}
                    {isCustomerView && timelineItems ? (
                      // Timeline Item Header for customer view
                      (() => {
                        const timelineItem = timelineItems.find(
                          (item) => item.getId().toString() === groupKey,
                        );
                        if (!timelineItem) return null;

                        return (
                          <div className="flex items-center gap-3 py-2">
                            <img
                              src={timelineItem.getIcon()}
                              alt={timelineItem.getLabel()}
                              className="h-6 w-6"
                            />
                            <h3 className="text-lg font-semibold text-[#212B36]">
                              {timelineItem.getLabel()}
                            </h3>
                            <span className="text-sm text-[#637381]">
                              ({events.length} event
                              {events.length !== 1 ? "s" : ""})
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      // Date Divider for staff/public views
                      <DateDivider
                        date={formatDateDisplay(groupKey)}
                        showExpandToggle={true}
                        isExpanded={expandedGroups[groupKey] || false}
                        onToggleExpand={() => toggleGroup(groupKey)}
                      />
                    )}

                    {/* Events for this group */}
                    {(isCustomerView || expandedGroups[groupKey] !== false) && (
                      <div className="space-y-3">
                        {events.map((event, index) => {
                          // Check if this is an extension message (starts with [AI SMART DEALS])
                          const isExtensionMessage =
                            event
                              .getMessage()
                              ?.startsWith("[AI SMART DEALS]") || false;

                          // Use UserEventCard for user messages (events without a label and not extension messages), otherwise use system message styling
                          // For customer events, treat them as system events since they're automated notifications
                          const isSystemMessage =
                            event.getLabel() !== null ||
                            isExtensionMessage ||
                            isCustomerView;
                          if (!isSystemMessage) {
                            return (
                              <UserEventCard
                                key={event.getId()}
                                event={event}
                                onReply={onReply}
                              />
                            );
                          }

                          // System message rendering
                          return (
                            <SystemEventCard
                              key={event.getId()}
                              event={event}
                              isLast={index === events.length - 1}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingTimeline;
