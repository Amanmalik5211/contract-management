"use client";

import { PageLoader } from "@/components/ui/loader";
import type { PageLayoutProps } from "@/types/components";

export function PageLayout({ 
  children, 
  isLoading = false, 
  loadingText = "Loading...",
  className = "" 
}: PageLayoutProps) {
  if (isLoading) {
    return <PageLoader text={loadingText} />;
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

