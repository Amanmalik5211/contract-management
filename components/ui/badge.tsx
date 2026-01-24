import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow-md",
          {
            "bg-blue-500 text-white border border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-700": variant === "default",
            "bg-gray-500 text-white border border-gray-600 dark:bg-gray-600 dark:text-white dark:border-gray-700": variant === "secondary",
            "bg-green-500 text-white border border-green-600 dark:bg-green-600 dark:text-white dark:border-green-700": variant === "success",
            "bg-yellow-500 text-white border border-yellow-600 dark:bg-yellow-600 dark:text-white dark:border-yellow-700": variant === "warning",
            "bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:text-white dark:border-red-700": variant === "destructive",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };

