import * as RadixTooltip from "@radix-ui/react-tooltip";
import React from "react";
import clsx from "clsx";

export type TooltipProps = RadixTooltip.TooltipContentProps &
  Pick<
    RadixTooltip.TooltipProps,
    "open" | "defaultOpen" | "onOpenChange" | "delayDuration"
  > & {
    content: React.ReactNode;
    side?: "bottom" | "left" | "top" | "right";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    maxWidth?: number;
  };

const Tooltip = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  maxWidth = 220,
  className,
  side,
  onClick,
  ...props
}: TooltipProps) => {
  return (
    <RadixTooltip.Provider delayDuration={100}>
      <RadixTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={delayDuration}
      >
        <RadixTooltip.Trigger onClick={onClick} asChild={true}>
          <span>{children}</span>
        </RadixTooltip.Trigger>
        {content && (
          <RadixTooltip.Content
            side={side ?? "bottom"}
            sideOffset={8}
            align="center"
            className={clsx(
              "z-[999] rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg",
              className,
            )}
            style={{ maxWidth }}
            {...props}
          >
            {content}
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        )}
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
