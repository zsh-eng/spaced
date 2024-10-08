"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/utils/ui";
import { buttonVariants } from "@/components/ui/button";

const TooltipProvider = ({
  children,
  delayDuration = 100,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}>
    {children}
  </TooltipPrimitive.Provider>
);
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipIconButton = ({
  children,
  tooltipContent,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & {
  tooltipContent?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "icon",
          }),
          props.className,
        )}
        {...props}
      >
        {children}
      </TooltipTrigger>

      {tooltipContent && (
        <TooltipContent className="flex flex-col items-center">
          <p>{tooltipContent}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipIconButton,
};
