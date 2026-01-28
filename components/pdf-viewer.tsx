"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PdfPage } from "./pdf-viewer/pdf-page";
import { PdfLoadingState } from "./pdf-viewer/pdf-loading-state";
import { PdfErrorState } from "./pdf-viewer/pdf-error-state";

// Dynamically import pdf.js only on client side to avoid DOMMatrix SSR error
const getPdfjsLib = async () => {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
};

interface PdfViewerProps {
  pdfUrl: string;
  className?: string;
  onPageRefsReady?: (refs: Map<number, HTMLDivElement | null>) => void;
  onPageRender?: (pageNum: number, element: HTMLDivElement | null) => void;
}

// Type for PDF document from pdfjs-dist (using unknown to avoid type conflicts)
type PdfDocument = {
  numPages: number;
  getPage: (pageNum: number) => Promise<unknown>;
};

// Yield to the event loop to prevent blocking
const yieldToEventLoop = () => {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: 1 });
    } else {
      setTimeout(() => resolve(), 0);
    }
  });
};

// Render a single page with lower scale for faster rendering
const renderPage = async (pdf: PdfDocument, pageNum: number, scale: number = 1.2) => {
  // Yield before starting
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
  
  // Yield after getting page
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
  
  // Yield after rendering
  await yieldToEventLoop();
  
  // Convert to data URL in chunks to avoid blocking
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

  // Progressive rendering: render pages one at a time with yielding (stable callback, no deps)
  const renderPagesBatch = useCallback(async (pdf: PdfDocument, startPage: number, endPage: number) => {
    const pagesToRender: number[] = [];
    
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      if (!renderedPagesRef.current.has(pageNum) && !renderingRef.current.has(pageNum)) {
        pagesToRender.push(pageNum);
      }
    }

    // Render one page at a time to prevent blocking
    for (const pageNum of pagesToRender) {
      // Mark as rendering
      renderingRef.current.add(pageNum);
      
      // Yield before rendering
      await yieldToEventLoop();
      
      // Render single page
      const result = await renderPage(pdf, pageNum);
      
      // Update state and ref after each page
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
      
      // Remove from rendering set
      renderingRef.current.delete(pageNum);
      
      // Yield after each page to keep UI responsive
      await yieldToEventLoop();
    }
  }, []);

  // Lazy load pages when they come into view
  useEffect(() => {
    if (!pdfRef.current || numPages === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page-num") || "0");
            if (pageNum > 0 && !renderedPagesRef.current.has(pageNum) && !renderingRef.current.has(pageNum) && pdfRef.current) {
              // Render this page and one ahead (reduced from 2 to keep it lighter)
              const endPage = Math.min(pageNum + 1, numPages);
              // Use setTimeout to defer rendering and not block the observer callback
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

    // Observe all page containers
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

        // Dynamically import pdf.js on client side
        const pdfjsLib = await getPdfjsLib();
        if (!pdfjsLib) {
          setError("PDF.js not available");
          setLoading(false);
          return;
        }

        // Load the PDF document (yield during loading)
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        
        // Yield to allow UI to update
        await yieldToEventLoop();
        
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        // Yield again after loading
        await yieldToEventLoop();

        const totalPages = pdf.numPages;
        setNumPages(totalPages);
        pdfRef.current = pdf;

        // Initialize pages array with placeholders
        const initialPages = Array.from({ length: totalPages }, (_, i) => ({
          pageNum: i + 1,
          imageData: null as string | null,
        }));
        setPages(initialPages);

        // Show UI immediately, then render first page
        setLoading(false);
        
        // Yield before starting to render
        await yieldToEventLoop();
        
        // Only render first page immediately to keep UI responsive
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

  // Update page refs when pages are rendered
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
    
    // Observe the element for lazy loading
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

