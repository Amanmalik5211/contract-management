"use client";

interface DashboardGraphsHeaderProps {
  viewType: "contract" | "blueprint";
}

export function DashboardGraphsHeader({ viewType }: DashboardGraphsHeaderProps) {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
        {viewType === "contract" ? "Contract" : "Blueprint"} Analytics
      </h2>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
        Visual insights into your {viewType === "contract" ? "contract" : "blueprint"} data
      </p>
    </div>
  );
}

