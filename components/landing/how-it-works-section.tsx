"use client";

import { Layers, FilePlus, Workflow, Lock, BarChart, ChevronRight } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl mb-3 sm:mb-4 px-2">
            How ContractFlow Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            From blueprint to locked contract in a few clear steps
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-4">
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-3 sm:mb-4">
                  <Layers className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                </div>
                <div className="sm:hidden absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-primary/20 -z-10" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  Step 1
                </h3>
                <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Create a Blueprint</h4>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Define contract structure with fields and layout.
                </p>
              </div>
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-3 sm:mb-4">
                  <FilePlus className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                </div>
                <div className="sm:hidden absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-primary/20 -z-10" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  Step 2
                </h3>
                <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Generate Contract</h4>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Create a contract instance from an existing blueprint.
                </p>
              </div>
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-3 sm:mb-4">
                  <Workflow className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                </div>
                <div className="sm:hidden absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-primary/20 -z-10" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  Step 3
                </h3>
                <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Manage Lifecycle</h4>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Move contract through Created → Approved → Sent.
                </p>
              </div>
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-3 sm:mb-4">
                  <Lock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                </div>
                <div className="sm:hidden absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-primary/20 -z-10" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  Step 4
                </h3>
                <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Sign & Lock</h4>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Capture signature and lock the contract permanently.
                </p>
              </div>
              <div className="hidden lg:block absolute top-12 left-full w-full">
                <ChevronRight className="h-6 w-6 text-primary/40 mx-auto" />
              </div>
            </div>

            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl mb-3 sm:mb-4">
                  <BarChart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  Step 5
                </h3>
                <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">View & Track</h4>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
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

