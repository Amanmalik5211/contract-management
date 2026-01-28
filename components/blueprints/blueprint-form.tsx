"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Field } from "@/types/field";
import { useToast } from "@/components/ui/toaster";
import { X, Layers, FileText, Upload, Sparkles } from "lucide-react";
import { PdfBlueprintEditor } from "@/components/pdf-blueprint-editor";
import { InlineLoader } from "@/components/ui/loader";

// Dynamically import pdf.js only on client side to avoid DOMMatrix SSR error
const getPdfjsLib = async () => {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
};

interface BlueprintFormProps {
  initialData?: {
    name: string;
    fields: Field[];
  };
  onSubmit: (data: {
    name: string;
    fields: Field[];
    pdfFileName?: string;
    pdfUrl?: string;
    pageCount?: number;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function BlueprintForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Blueprint",
}: BlueprintFormProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    fields: initialData?.fields || [] as Field[],
  });
  const [pdfFile, setPdfFile] = useState<{
    file: File;
    fileName: string;
    url: string;
    pageCount?: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maximum file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);

    // Validate file type
    if (file.type !== "application/pdf") {
      addToast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "error",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      addToast({
        title: "File Too Large",
        description: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        variant: "error",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Convert file to base64 and get page count
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      // Get page count using PDF.js
      try {
        const pdfjsLib = await getPdfjsLib();
        if (!pdfjsLib) {
          // If PDF.js not available, continue without page count
          setPdfFile({
            file,
            fileName: file.name,
            url: base64,
            pageCount: undefined,
          });
          return;
        }
        
        const loadingTask = pdfjsLib.getDocument({ data: base64 });
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        
        setPdfFile({
          file,
          fileName: file.name,
          url: base64, // Store as base64 data URL
          pageCount: pageCount,
        });
        setIsUploading(false);
      } catch {
        // If PDF.js fails, still set the file but without page count
        setPdfFile({
          file,
          fileName: file.name,
          url: base64,
          pageCount: undefined,
        });
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      addToast({
        title: "Error",
        description: "Failed to read PDF file.",
        variant: "error",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    // No need to revoke URL if using base64
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      addToast({
        title: "Validation Error",
        description: "Please provide a blueprint name.",
        variant: "error",
      });
      return;
    }

    if (!pdfFile) {
      addToast({
        title: "Validation Error",
        description: "Please upload a PDF file.",
        variant: "error",
      });
      return;
    }

    if (formData.fields.length === 0) {
      addToast({
        title: "Validation Error",
        description: "Please add at least one field.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit({
        ...formData,
        pdfFileName: pdfFile.fileName,
        pdfUrl: pdfFile.url,
        pageCount: pdfFile.pageCount,
      });
      // Reset form after submission
      setFormData({
        name: "",
        fields: [],
      });
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }

    // Reset form after submission
    setFormData({
      name: "",
      fields: [],
    });
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 dark:from-primary/10 dark:via-primary/5" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 lg:p-8">
        {/* Left Side - Visual Design */}
        <div className="lg:col-span-4 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
          <div className="relative w-full max-w-[200px] mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-primary/30 to-primary/20 rounded-2xl p-8 shadow-lg">
              <Layers className="h-16 w-16 text-primary mx-auto" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-4 text-center w-full">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary">Upload PDF</span>
              <span className="text-xs text-muted-foreground">Template file</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary">Add Fields</span>
              <span className="text-xs text-muted-foreground">Interactive placement</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary">Reusable</span>
              <span className="text-xs text-muted-foreground">Create contracts</span>
            </div>
          </div>
          <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
        </div>

        {/* Right Side - Form Content */}
        <div className="lg:col-span-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">{submitLabel}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Create a reusable template for your contracts
            </p>
          </div>
          <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Blueprint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Service Agreement"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 h-9 sm:h-10 md:h-11 rounded-lg sm:rounded-xl md:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-sm text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* PDF Upload Section */}
        <div className="space-y-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 shadow-md">
          <div className="space-y-3">
            <Label htmlFor="pdfFile" className="block text-xs sm:text-sm font-medium">
              PDF Template <span className="text-red-500">*</span>
            </Label>
            <label
              htmlFor="pdfFile"
              className="flex items-center min-h-10 sm:min-h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
            >
              <span className="inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-4 sm:px-5 bg-primary text-primary-foreground text-sm font-medium shrink-0 hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4 shrink-0" />
                <span>Choose File</span>
              </span>
              <span className="flex-1 px-3 py-2.5 text-sm text-muted-foreground truncate min-w-0  border-l border-gray-200 dark:border-gray-600">
                {pdfFile ? pdfFile.fileName : "No file chosen"}
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="pdfFile"
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="sr-only"
              aria-label="Choose PDF file"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Upload a PDF file (max 10MB)
            </p>
          </div>

          {/* Display uploaded PDF with remove */}
          {pdfFile && (
            <div className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pdfFile.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {(pdfFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePdf}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* PDF Blueprint Editor - Visual Field Placement */}
        {pdfFile && (
          <div className="space-y-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 shadow-md">
            <h3 className="font-semibold text-base sm:text-lg">Place Fields on PDF</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a field type and click on the PDF to place fields. You can edit field labels and delete fields after placing them.
            </p>
            <PdfBlueprintEditor
              pdfUrl={pdfFile.url}
              fields={formData.fields}
              onFieldsChange={(newFields) => {
                setFormData({ ...formData, fields: newFields });
              }}
            />
          </div>
        )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-300 dark:border-gray-700 pt-6">
              {onCancel && (
                <Button variant="outline" size="lg" onClick={onCancel} className="w-full sm:w-auto h-11 sm:h-12 px-6 shadow-md">
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || !pdfFile || formData.fields.length === 0 || isSubmitting || isUploading}
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12 px-8 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <InlineLoader size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

