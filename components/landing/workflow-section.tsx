"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function WorkflowSection() {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
            How It Works
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
            Streamline your contract management from creation to completion
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1">
            <Image
              src="/contract-landing-page.png"
              alt="Contract Management"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                Create reusable blueprints with customizable fields and PDF templates to standardize your contract structure.
              </p>
              <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                Generate contracts from blueprints, fill in the required information, and manage the entire lifecycle from creation to approval.
              </p>
              <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                Track contract status, capture signatures, and download finalized PDFs with all your data seamlessly integrated.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/blueprints" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto">
                  Create Blueprint
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

