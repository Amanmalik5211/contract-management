"use client";

interface ContractsPageHeaderProps {
  title?: string;
  description?: string;
}

export function ContractsPageHeader({
  title = "Contracts",
  description = "Manage and track all your contracts",
}: ContractsPageHeaderProps) {
  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
            <span className="text-primary">{title}</span>
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

