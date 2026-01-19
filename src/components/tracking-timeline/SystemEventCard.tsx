import React, { useState } from "react";
import { TrackingEventModel } from "../../models/trackingEventCollectionModel";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemEventCardProps {
  event: TrackingEventModel;
  isLast: boolean;
}

const SystemEventCard: React.FC<SystemEventCardProps> = ({
  event,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this is an extension message
  const isExtensionMessage =
    event.getContent()?.startsWith("[AI SMART DEALS]") || false;

  // Parse extension message format: [AI SMART DEALS] [TEMPLATE:Template Name] [MESSAGE:Actual message content]
  const parseExtensionMessage = (message: string) => {
    const templateMatch = message.match(/\[TEMPLATE:(.*?)\]/);
    const messageMatch = message.match(/\[MESSAGE:(.*?)\]/);

    return {
      extension: "AI Smart Deals",
      template: templateMatch ? templateMatch[1] : null,
      content: messageMatch ? messageMatch[1] : message,
    };
  };

  const extensionData = isExtensionMessage
    ? parseExtensionMessage(event.getContent() || "")
    : null;

  const bulletColors = {
    default: "bg-[#637381]",
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    error: "bg-[#EF4444]",
  };

  const actorStyles = {
    user: "bg-[#008060] text-white",
    system: "bg-[#6366F1] text-white",
    automation: "bg-[#8B5CF6] text-white",
    customer: "bg-[#F59E0B] text-white",
  };

  // Determine actor information
  const actor:
    | {
        name: string;
        type: "user" | "system" | "automation" | "customer";
        initials?: string;
      }
    | undefined = isExtensionMessage
    ? {
        name: "AI Smart Deals",
        type: "automation" as const,
        initials: "AI",
      }
    : event.getCauser()
      ? {
          name: event.getCauser()?.getName() || "Unknown",
          type: "user" as const,
          initials:
            event.getCauser()?.getName()?.charAt(0).toUpperCase() || "U",
        }
      : {
          name: "Administrative Action",
          type: "system" as const,
          initials: "A",
        };

  // Determine event type based on content or label
  const getEventType = (): "default" | "success" | "warning" | "error" => {
    // Extension messages are always success events
    if (isExtensionMessage) {
      return "success";
    }

    const label = event.getLabel()?.toLowerCase() || "";
    const message = event.getContent()?.toLowerCase() || "";

    if (
      label.includes("error") ||
      label.includes("failed") ||
      message.includes("error")
    ) {
      return "error";
    }
    if (
      label.includes("success") ||
      label.includes("completed") ||
      message.includes("success")
    ) {
      return "success";
    }
    if (
      label.includes("warning") ||
      label.includes("alert") ||
      message.includes("warning")
    ) {
      return "warning";
    }
    return "default";
  };

  const eventType = getEventType();

  const renderTitle = () => {
    // Special handling for extension messages
    if (isExtensionMessage && extensionData) {
      if (extensionData.template) {
        return (
          <span>
            Message sent using template:{" "}
            <span className="font-medium text-[#008060]">
              {extensionData.template}
            </span>
          </span>
        );
      } else {
        // No template used, show message directly
        return (
          <span>
            Message sent:{" "}
            <span className="text-[#637381]">{extensionData.content}</span>
          </span>
        );
      }
    }

    const title =
      event.getLabel() || event.getTimelineItem()?.getLabel() || "System Event";

    return <span>{title}</span>;
  };

  const timestamp = new Date(event.getCreatedAt()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const details =
    isExtensionMessage && extensionData ? (
      <div className="space-y-2">
        {extensionData.template && (
          <div className="text-sm text-[#637381]">
            <strong>Template:</strong> {extensionData.template}
          </div>
        )}
        <div className="text-sm text-[#637381]">
          <strong>Message:</strong>
        </div>
        <div className="rounded border-l-2 border-[#008060] bg-[#F9FAFB] p-2 text-sm text-[#212B36]">
          {extensionData.content}
        </div>
      </div>
    ) : event.getContent() ? (
      <div
        className="text-sm text-[#637381]"
        dangerouslySetInnerHTML={{ __html: event.getContent() || "" }}
      />
    ) : null;

  return (
    <div className="relative">
      {/* Minimal timeline line */}
      {!isLast && (
        <div className="absolute bottom-0 left-[5px] top-4 w-[1px] bg-[#E5E7EB]" />
      )}

      {/* Timeline entry */}
      <div
        className={`relative -mx-2 flex items-start gap-2.5 rounded px-2 py-1.5 transition-colors ${
          details ? "cursor-pointer" : ""
        } ${isExpanded ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]"}`}
        onClick={() => details && setIsExpanded(!isExpanded)}
      >
        {/* Minimal bullet point */}
        <div className="relative z-10 mt-1.5">
          <div
            className={`h-2.5 w-2.5 rounded-full ${bulletColors[eventType]} border border-white`}
          ></div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="mb-1 text-sm leading-snug text-[#212B36]">
                {renderTitle()}
              </p>
              {actor && (
                <div className="flex items-center gap-1.5">
                  {actor.initials && (
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded text-[8px] ${actorStyles[actor.type]}`}
                    >
                      {actor.initials}
                    </div>
                  )}
                  <span className="text-[10px] text-[#637381]">
                    {actor.name === "Administrative Action"
                      ? actor.name
                      : actor.type === "user" && "Triggered by: " + actor.name}
                    {actor.type === "system" &&
                      actor.name !== "Administrative Action" &&
                      "System: " + actor.name}
                    {actor.type === "automation" && "Automation: " + actor.name}
                    {actor.type === "customer" && "Customer: " + actor.name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="text-xs text-[#637381]">{timestamp}</span>
              {details && (
                <motion.div
                  className="text-[#637381]"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Expanded details - minimal */}
          <AnimatePresence>
            {isExpanded && details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded border border-[#E5E7EB] bg-white p-3 text-sm">
                  {details}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SystemEventCard;
