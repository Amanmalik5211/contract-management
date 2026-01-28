import * as React from "react";
import { cn } from "@/lib/utils";
import type { SelectProps } from "@/types/ui";

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 sm:h-10 md:h-11 w-full rounded-lg sm:rounded-xl  border-gray-200 dark:border-gray-600 bg-blue-400 px-8 sm:px-4 py-2 text-xs sm:text-sm ring-offset-white dark:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };

