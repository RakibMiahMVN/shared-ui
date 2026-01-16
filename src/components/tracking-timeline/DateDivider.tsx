import { ChevronDown, ChevronUp } from "lucide-react";

interface DateDividerProps {
  date: string;
  showExpandToggle?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function DateDivider({
  date,
  showExpandToggle = false,
  isExpanded = false,
  onToggleExpand,
}: DateDividerProps) {
  return (
    <div className="relative flex items-center py-3">
      <div className="absolute bottom-0 left-[5px] top-0 w-[1px] bg-[#E5E7EB]" />
      <div className="relative z-10 bg-white pr-3">
        <span className="text-xs text-[#637381]">{date}</span>
      </div>
      <div className="h-[1px] flex-1 bg-[#E5E7EB]" />

      {showExpandToggle && (
        <button
          onClick={onToggleExpand}
          className="relative z-10 flex items-center gap-1.5 bg-white pl-3 text-xs text-[#637381] transition-colors hover:text-[#008060]"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Collapse all</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Expand all</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
