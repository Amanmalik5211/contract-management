import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0": variant === "default",
            "border border-border/50 bg-background hover:bg-muted hover:text-accent-foreground shadow-md hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 active:translate-y-0": variant === "outline",
            "hover:bg-muted/50 hover:text-accent-foreground": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0": variant === "destructive",
            "h-9 sm:h-10 px-3 sm:px-4 py-2": size === "default",
            "h-8 sm:h-9 px-2 sm:px-3 text-xs": size === "sm",
            "h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

