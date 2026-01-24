"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = "default",
  onClose,
}) => {
  const variantStyles = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  const iconColors = {
    default: "text-gray-600",
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
  };

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between space-x-2 sm:space-x-4 overflow-hidden rounded-md border p-2 sm:p-4 pr-6 sm:pr-8 shadow-lg transition-all",
        variantStyles[variant]
      )}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <div className={cn("text-xs sm:text-sm font-semibold", iconColors[variant])}>
            {title}
          </div>
        )}
        {description && (
          <div className="text-xs sm:text-sm text-gray-600 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
      >
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
};

export { Toast };

