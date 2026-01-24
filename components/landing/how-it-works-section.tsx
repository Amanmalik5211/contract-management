"use client";

import { Layers, FilePlus, Workflow, Lock, BarChart, ChevronRight } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-24 ">
      <div className="mx-auto max-w-7xl px-0">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How ContractFlow Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From blueprint to locked contract in a few clear steps
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {/* Step 1 - Create a Blueprint */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-4">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <div className="md:hidden absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-primary/20 -z-10" />
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Step 1
                </h3>
                <h4 className="text-base font-medium mb-2">Create a Blueprint</h4>
                <p className="text-sm text-muted-foreground">
                  Define contract structure with fields and layout.
                </p>
              </div>
              {/* Arrow - Desktop */}
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            {/* Step 2 - Generate Contract */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-4">
                  <FilePlus className="h-8 w-8 text-primary" />
                </div>
                <div className="md:hidden absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-primary/20 -z-10" />
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Step 2
                </h3>
                <h4 className="text-base font-medium mb-2">Generate Contract</h4>
                <p className="text-sm text-muted-foreground">
                  Create a contract instance from an existing blueprint.
                </p>
              </div>
              {/* Arrow - Desktop */}
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            {/* Step 3 - Manage Lifecycle */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-4">
                  <Workflow className="h-8 w-8 text-primary" />
                </div>
                <div className="md:hidden absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-primary/20 -z-10" />
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Step 3
                </h3>
                <h4 className="text-base font-medium mb-2">Manage Lifecycle</h4>
                <p className="text-sm text-muted-foreground">
                  Move contract through Created → Approved → Sent.
                </p>
              </div>
              {/* Arrow - Desktop */}
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            {/* Step 4 - Sign & Lock */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <div className="md:hidden absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-primary/20 -z-10" />
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Step 4
                </h3>
                <h4 className="text-base font-medium mb-2">Sign & Lock</h4>
                <p className="text-sm text-muted-foreground">
                  Capture signature and lock the contract permanently.
                </p>
              </div>
              {/* Arrow - Desktop */}
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            {/* Step 5 - View & Track */}
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-4">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Step 5
                </h3>
                <h4 className="text-base font-medium mb-2">View & Track</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor contract status from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

