import React, { useState } from "react";
import { Eye, Users, Bell } from "lucide-react";
import { NotifyCustomerModal } from "./NotifyCustomerModal";

type FilterType = "staff" | "customer" | "public";

interface VisibilityFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  buyProductId: string;
  // App-specific dependencies passed as props
  isSuperAgent?: boolean;
  onSendNotification?: (data: {
    message: string;
    emailSubject?: string;
    emailBody?: string;
    channels: string[];
  }) => Promise<void>;
  // AI functionality (optional)
  apiKey?: string;
}

export function VisibilityFilter({
  activeFilter,
  onFilterChange,
  buyProductId,
  isSuperAgent = false,
  onSendNotification,
  apiKey,
}: VisibilityFilterProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const filters: {
    type: FilterType;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: "staff",
      label: "Staff Only",
      icon: <Users className="h-3.5 w-3.5" />,
      color: "text-[#637381] hover:bg-gray-50",
    },
    {
      type: "customer",
      label: "Customer Only",
      icon: <Eye className="h-3.5 w-3.5" />,
      color: "text-green-600 hover:bg-green-50",
    },
    {
      type: "public",
      label: "Public",
      icon: <Eye className="h-3.5 w-3.5" />,
      color: "text-blue-600 hover:bg-blue-50",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 rounded border border-[#E5E7EB] bg-white p-2">
        <span className="mr-1 text-xs text-[#637381]">Show:</span>
        {filters.map((filter) => (
          <button
            key={filter.type}
            onClick={() => onFilterChange(filter.type)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-all ${
              activeFilter === filter.type
                ? filter.type === "staff"
                  ? "border border-gray-200 bg-gray-100 text-[#212B36]"
                  : filter.type === "customer"
                    ? "border border-green-200 bg-green-100 text-green-700"
                    : filter.type === "public"
                      ? "border border-blue-200 bg-blue-100 text-blue-700"
                      : "border border-[#E5E7EB] bg-[#F3F4F6] text-[#212B36]"
                : `${filter.color} border border-transparent`
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        ))}

        {/* Notify Customer Button - Only visible when customer filter is active and user is super agent */}
        {isSuperAgent && (
          <div className="ml-2 border-l border-[#E5E7EB] pl-2">
            <button
              onClick={() => setShowNotifyModal(true)}
              className="flex items-center gap-1.5 rounded border border-transparent px-2.5 py-1.5 text-xs text-blue-600 transition-all hover:bg-blue-50"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Notify Customer</span>
            </button>
          </div>
        )}
      </div>

      {/* Notify Customer Modal */}
      {showNotifyModal && (
        <NotifyCustomerModal
          onClose={() => setShowNotifyModal(false)}
          buyProductId={buyProductId}
          onSendNotification={onSendNotification}
          apiKey={apiKey}
        />
      )}
    </>
  );
}
