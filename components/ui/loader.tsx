"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function Loader({ 
  size = "md", 
  className, 
  text,
  fullScreen = false,
  overlay = false 
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        {spinner}
      </div>
    );
  }

  return spinner;
}

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  );
}

interface ButtonLoaderProps {
  size?: "sm" | "md" | "lg";
}

export function ButtonLoader({ size = "sm" }: ButtonLoaderProps) {
  return <Loader size={size} className="inline-flex" />;
}

// Inline loader for buttons (just the spinner, no text)
export function InlineLoader({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };
  return <Loader2 className={cn("animate-spin text-current", sizeClasses[size], className)} />;
}

