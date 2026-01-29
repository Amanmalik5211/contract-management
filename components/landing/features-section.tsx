"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowRightCircle, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
            Powerful Features for Modern Contract Management
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
            Everything you need to create, manage, and track contracts efficiently
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <Layers className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors duration-300">Create Once, Reuse Everywhere</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Design reusable contract blueprints with structured fields like text, date, checkbox, and signature, then generate consistent contracts from them.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <ArrowRightCircle className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors duration-300">Predictable Contract Workflow</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Every contract follows a fixed lifecycle with controlled transitions, ensuring no steps are skipped and the process remains compliant.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20 md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors duration-300">Smart Permissions by Status</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Contracts are view-only by default, editable only in the Created state, and automatically restricted once approved, signed, or locked.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}

