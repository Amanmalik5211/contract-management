"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ImageSection() {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1">
            <Image
              src="/contract-landing-page.png"
              alt="Contract Management Platform"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl leading-tight">
                Streamline Your Contract Workflow
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Experience seamless contract management with intelligent automation, 
                real-time tracking, and secure document handling.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed">
                Transform how you create, manage, and track contracts with our 
                powerful platform designed for modern businesses.
              </p>
            </div>
            <div>
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
