"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ImageSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/contract-landing-page.png"
              alt="Contract Management Platform"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Streamline Your Contract Workflow
              </h2>
              <p className="text-lg text-muted-foreground">
                Experience seamless contract management with intelligent automation, 
                real-time tracking, and secure document handling.
              </p>
              <p className="text-base text-muted-foreground/80">
                Transform how you create, manage, and track contracts with our 
                powerful platform designed for modern businesses.
              </p>
            </div>
            <div>
              <Link href="/blueprints">
                <Button size="lg" className="group">
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
