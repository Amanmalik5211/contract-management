\"use client\";

import Image from "next/image";
import { Loader } from "@/components/ui/loader";
import type { PdfPageProps } from "@/types/components";

export function PdfPage({ pageNum, numPages, imageData, onPageRef }: PdfPageProps) {
  return (
    <div
      key={pageNum}
      data-page-num={pageNum}
      ref={(el) => onPageRef?.(pageNum, el)}
      className="flex justify-center px-2 sm:px-4"
    >
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-sm overflow-hidden bg-white dark:bg-gray-900 min-h-[200px] sm:min-h-[300px] md:min-h-[400px] flex items-center justify-center w-full max-w-full">
        {imageData ? (
          <>
            <Image
              src={imageData}
              alt={`Page ${pageNum} of ${numPages}`}
              className="block w-full h-auto max-w-full"
              style={{ maxWidth: "100%" }}
              loading="lazy"
              width={800}
              height={1131}
              unoptimized
            />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              Page {pageNum} of {numPages}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
            <Loader size="sm" text={`Loading page ${pageNum}...`} />
          </div>
        )}
      </div>
    </div>
  );
}

