"use client";

import { FileText, FileCheck, Sparkles } from "lucide-react";

export function ContractCreationFormVisual() {
  return (
    <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
      <div className="relative w-full max-w-[200px] mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-primary/30 to-primary/20 rounded-2xl p-8 shadow-lg">
          <FileText className="h-16 w-16 text-primary mx-auto" strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Quick Creation</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Template-Based</span>
        </div>
      </div>
      <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
    </div>
  );
}

