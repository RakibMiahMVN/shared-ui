import React, { createContext, useContext, useState, ReactNode } from "react";
import { FilterType } from "./types";

interface TrackingTimelineContextType {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  expandedGroups: Record<string, boolean>;
  setExpandedGroups: (groups: Record<string, boolean>) => void;
  onAddComment: (html: string) => Promise<void>;
  isSubmittingComment: boolean;
  commentError?: any;
}

const TrackingTimelineContext = createContext<
  TrackingTimelineContextType | undefined
>(undefined);

interface TrackingTimelineProviderProps {
  children: ReactNode;
  initialFilter?: FilterType;
  onAddComment: (html: string) => Promise<void>;
  isSubmittingComment: boolean;
  commentError?: any;
}

export const TrackingTimelineProvider: React.FC<
  TrackingTimelineProviderProps
> = ({
  children,
  initialFilter = "staff",
  onAddComment,
  isSubmittingComment,
  commentError,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const value = {
    activeFilter,
    setActiveFilter,
    expandedGroups,
    setExpandedGroups,
    onAddComment,
    isSubmittingComment,
    commentError,
  };

  return (
    <TrackingTimelineContext.Provider value={value}>
      {children}
    </TrackingTimelineContext.Provider>
  );
};

export const useTrackingTimeline = () => {
  const context = useContext(TrackingTimelineContext);
  if (context === undefined) {
    throw new Error(
      "useTrackingTimeline must be used within a TrackingTimelineProvider",
    );
  }
  return context;
};
