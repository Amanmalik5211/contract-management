"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Layout, Home, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Image
                  src="/logo.webp"
                  alt="Contractify Logo"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 object-contain rounded-lg"
                  priority
                />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                Contractify
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Streamline your contract management with intelligent automation and seamless collaboration tools.
            </p>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/blueprints" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Blueprints
                </Link>
              </li>
              <li>
                <Link href="/contracts" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contracts
                </Link>
              </li>
              <li>
                <Link href="/contracts/new" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Create Contract
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <a href="mailto:support@contractify.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  support@contractify.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  123 Business Street<br />
                  Suite 100<br />
                  City, State 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Contractify. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center md:justify-end">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

