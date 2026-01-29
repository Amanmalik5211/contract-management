"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
<div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">


        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
                Streamline Your
                <span className="text-primary"> Contract Management</span>
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                Create, manage, and track contracts with ease. Build templates, 
                generate documents, and stay on top of your agreements.
              </p>
              <p className="text-sm text-muted-foreground/80 sm:text-base lg:text-lg leading-relaxed">
                Simplify your workflow with intelligent contract automation and seamless collaboration tools.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto">
                  Track Contract
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contracts/new" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Contract
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative w-full h-full min-h-[250px] xs:min-h-[300px] sm:min-h-[350px] lg:min-h-[500px] rounded-2xl sm:rounded-3xl 
shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] 
border border-border/50 overflow-hidden bg-muted">
            <Image
              src="/contract.webp"
              alt="Contractify - Contract Management"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

