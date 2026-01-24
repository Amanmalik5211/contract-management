"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowRightCircle, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-0">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Features for Modern Contract Management
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to create, manage, and track contracts efficiently
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 - Blueprint-Based Contract Creation */}
          <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <Layers className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">Create Once, Reuse Everywhere</CardTitle>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Design reusable contract blueprints with structured fields like text, date, checkbox, and signature, then generate consistent contracts from them.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2 - Controlled Contract Lifecycle */}
          <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <ArrowRightCircle className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">Predictable Contract Workflow</CardTitle>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Every contract follows a fixed lifecycle with controlled transitions, ensuring no steps are skipped and the process remains compliant.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3 - Status-Aware Editing & Security */}
          <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20 md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <ShieldCheck className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">Smart Permissions by Status</CardTitle>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Contracts are view-only by default, editable only in the Created state, and automatically restricted once approved, signed, or locked.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}

