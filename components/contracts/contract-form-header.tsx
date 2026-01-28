"use client";

interface ContractFormHeaderProps {
  description?: string;
}

export function ContractFormHeader({
  description = "Generate a new contract from a blueprint",
}: ContractFormHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8 md:mb-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
        Create <span className="text-primary">Contract</span>
      </h1>
      <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

