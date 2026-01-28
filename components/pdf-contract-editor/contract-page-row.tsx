"use client";

import type { ReactNode } from "react";
import NextImage from "next/image";
import type { Field } from "@/types/field";
import { Loader } from "@/components/ui/loader";

export interface ContractPageRowProps {
  pageNum: number;
  imageData: string | null;
  numPages: number;
  isEditable: boolean;
  pageFields: Field[];
  renderedDims: { width: number; height: number };
  renderField: (field: Field, pageWidth: number, pageHeight: number) => ReactNode;
  onPageRef: (pageNum: number, el: HTMLImageElement | null) => void;
  onImageLoad: (pageNum: number) => void;
}

export function ContractPageRow({
  pageNum,
  imageData,
  numPages,
  isEditable,
  pageFields,
  renderedDims,
  renderField,
  onPageRef,
  onImageLoad,
}: ContractPageRowProps) {
  return (
    <div className="flex justify-center relative w-full">
      <div
        className={`relative overflow-visible max-w-full rounded-lg bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.75)] ${isEditable ? "p-3 md:p-4" : ""}`}
      >
        <div className="relative min-h-[400px] bg-white flex items-center justify-center">
          {imageData ? (
            <NextImage
              src={imageData}
              alt={`Page ${pageNum} of ${numPages}`}
              width={renderedDims.width}
              height={renderedDims.height}
              unoptimized
              className={`block w-full h-auto ${isEditable ? "rounded" : ""}`}
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                onPageRef(pageNum, img);
                onImageLoad(pageNum);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Loader size="sm" text={`Loading page ${pageNum}...`} />
            </div>
          )}
          {imageData && isEditable && (
            <div className="absolute bottom-4 right-4 bg-background/90 text-foreground text-xs px-3 py-1.5 rounded-md z-0 font-medium shadow-sm border-0">
              Page {pageNum} of {numPages}
            </div>
          )}
          {imageData && !isEditable && (
            <div className="absolute bottom-2 right-2 bg-background/90 text-muted-foreground text-xs px-2 py-1 rounded z-0 font-normal opacity-90 border-0">
              Page {pageNum} of {numPages}
            </div>
          )}
          {imageData &&
            pageFields.length > 0 &&
            renderedDims.width > 0 &&
            renderedDims.height > 0 && (
              <div
                className="absolute top-0 left-0"
                style={{
                  width: `${renderedDims.width}px`,
                  height: `${renderedDims.height}px`,
                }}
              >
                {pageFields
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((field) =>
                    renderField(field, renderedDims.width, renderedDims.height)
                  )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
