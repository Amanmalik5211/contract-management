"use client";

interface ContractStatusHeaderProps {
  contractName: string;
}

export function ContractStatusHeader({ contractName }: ContractStatusHeaderProps) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
        Manage Contract <span className="text-primary">Status</span>
      </h1>
      <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">{contractName}</p>
    </section>
  );
}

