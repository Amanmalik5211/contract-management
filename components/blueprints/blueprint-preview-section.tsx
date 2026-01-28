"use client";

import { DocumentRenderer } from "@/components/document-renderer";
import { PdfViewer } from "@/components/pdf-viewer";
import type { Blueprint } from "@/types/blueprint";

interface BlueprintPreviewSectionProps {
  blueprint: Blueprint;
}

export function BlueprintPreviewSection({ blueprint }: BlueprintPreviewSectionProps) {
  if (blueprint.pdfUrl) {
    return (
      <section className="py-6 sm:py-8 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">PDF Template</h2>
          {blueprint.pdfFileName && (
            <p className="text-sm text-muted-foreground">
              File: {blueprint.pdfFileName}
              {blueprint.pageCount && ` • ${blueprint.pageCount} page${blueprint.pageCount !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <PdfViewer pdfUrl={blueprint.pdfUrl} />
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 mb-8">
      <DocumentRenderer
        title={blueprint.name}
        sections={[]}
        fields={blueprint.fields}
        fieldValues={{}}
        isEditable={false}
      />
    </section>
  );
}

