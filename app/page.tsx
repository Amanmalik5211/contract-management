"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export default function HomePage() {


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-0 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center py-8">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Streamline Your
                  <span className="text-primary"> Contract Management</span>
                </h1>
                <p className="text-lg text-muted-foreground sm:text-xl">
                  Create, manage, and track contracts with ease. Build templates, 
                  generate documents, and stay on top of your agreements.
                </p>
                <p className="text-base text-muted-foreground/80 sm:text-lg">
                  Simplify your workflow with intelligent contract automation and seamless collaboration tools.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="group">
                    Track Contract
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/contracts/new">
                  <Button size="lg" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Contract
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side - Image */}
            <div className="relative w-full h-full min-h-[350px] lg:min-h-[500px] rounded-3xl 
shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] 
border border-border/50 overflow-hidden bg-muted">

  <Image
    src="/contract.webp"
    alt="Contractify - Contract Management"
    fill
    className="object-cover"
    priority
    sizes="(max-width: 1024px) 100vw, 50vw"
  />
</div>

          </div>
        </div>
      </section>
    </div>
  );
}
