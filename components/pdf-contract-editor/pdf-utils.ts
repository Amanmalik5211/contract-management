export async function getPdfjsLib() {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
}

export function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: 1 });
    } else {
      setTimeout(() => resolve(), 0);
    }
  });
}
