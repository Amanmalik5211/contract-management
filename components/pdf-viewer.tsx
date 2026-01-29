"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PdfPage } from "./pdf-viewer/pdf-page";
import { PdfLoadingState } from "./pdf-viewer/pdf-loading-state";
import { PdfErrorState } from "./pdf-viewer/pdf-error-state";
import type { PdfViewerProps, PdfDocument } from "@/types/pdf";

const getPdfjsLib = async () => {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
};

const yieldToEventLoop = () => {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: 1 });
    } else {
      setTimeout(() => resolve(), 0);
    }
  });
};

const renderPage = async (pdf: PdfDocument, pageNum: number, scale: number = 1.2) => {
  await yieldToEventLoop();
  
  const page = await pdf.getPage(pageNum) as {
    getViewport: (options: { scale: number }) => {
      height: number;
      width: number;
    };
    render: (context: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { height: number; width: number };
      canvas?: HTMLCanvasElement;
    }) => { promise: Promise<void> };
  };
  
  await yieldToEventLoop();
  
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
  
  await yieldToEventLoop();
  
  const imageData = canvas.toDataURL("image/jpeg", 0.85); // Use JPEG with compression for faster processing
  
  return {
    pageNum,
    imageData,
  };
};

export function PdfViewer({ pdfUrl, className = "", onPageRefsReady, onPageRender }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pages, setPages] = useState<Array<{ pageNum: number; imageData: string | null }>>([]);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const pdfRef = useRef<PdfDocument | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const renderingRef = useRef<Set<number>>(new Set());
  const renderedPagesRef = useRef<Set<number>>(new Set());

  const renderPagesBatch = useCallback(async (pdf: PdfDocument, startPage: number, endPage: number) => {
    const pagesToRender: number[] = [];
    
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      if (!renderedPagesRef.current.has(pageNum) && !renderingRef.current.has(pageNum)) {
        pagesToRender.push(pageNum);
      }
    }

    for (const pageNum of pagesToRender) {
      renderingRef.current.add(pageNum);
      
      await yieldToEventLoop();
      
      const result = await renderPage(pdf, pageNum);
      
      if (result) {
        renderedPagesRef.current.add(pageNum);
        setPages(prev => {
          const newPages = [...prev];
          const pageIndex = newPages.findIndex(p => p.pageNum === result.pageNum);
          if (pageIndex >= 0) {
            newPages[pageIndex] = result;
          }
          return newPages;
        });
        
        setRenderedPages(prev => {
          const newSet = new Set(prev);
          newSet.add(pageNum);
          return newSet;
        });
      }
      
      renderingRef.current.delete(pageNum);
      
      await yieldToEventLoop();
    }
  }, []);

  useEffect(() => {
    if (!pdfRef.current || numPages === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page-num") || "0");
            if (pageNum > 0 && !renderedPagesRef.current.has(pageNum) && !renderingRef.current.has(pageNum) && pdfRef.current) {
              const endPage = Math.min(pageNum + 1, numPages);
              setTimeout(() => {
                if (pdfRef.current) {
                  renderPagesBatch(pdfRef.current, pageNum, endPage);
                }
              }, 0);
            }
          }
        });
      },
      { rootMargin: "200px" } // Start loading 200px before page is visible
    );

    pageRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [numPages, renderPagesBatch]);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setPages([]);
        setRenderedPages(new Set());
        renderingRef.current.clear();
        renderedPagesRef.current.clear();

        const pdfjsLib = await getPdfjsLib();
        if (!pdfjsLib) {
          setError("PDF.js not available");
          setLoading(false);
          return;
        }

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        
        await yieldToEventLoop();
        
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        await yieldToEventLoop();

        const totalPages = pdf.numPages;
        setNumPages(totalPages);
        pdfRef.current = pdf;

        const initialPages = Array.from({ length: totalPages }, (_, i) => ({
          pageNum: i + 1,
          imageData: null as string | null,
        }));
        setPages(initialPages);

        setLoading(false);
        
        await yieldToEventLoop();
        
        if (totalPages > 0) {
          await renderPagesBatch(pdf, 1, 1);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      pdfRef.current = null;
    };
  }, [pdfUrl, renderPagesBatch]);

  useEffect(() => {
    if (pages.length > 0 && onPageRefsReady) {
      onPageRefsReady(pageRefs.current);
    }
  }, [pages, onPageRefsReady]);

  const setPageRef = useCallback((pageNum: number, element: HTMLDivElement | null) => {
    pageRefs.current.set(pageNum, element);
    if (onPageRender) {
      onPageRender(pageNum, element);
    }
    
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, [onPageRender]);

  if (loading) {
    return <PdfLoadingState className={className} />;
  }

  if (error) {
    return <PdfErrorState error={error} className={className} />;
  }

  return (
    <div className={className}>
      <div className="space-y-3 sm:space-y-4">
        {pages.map(({ pageNum, imageData }) => (
          <PdfPage
            key={pageNum}
            pageNum={pageNum}
            numPages={numPages}
            imageData={imageData}
            onPageRef={setPageRef}
          />
        ))}
      </div>
    </div>
  );
}

