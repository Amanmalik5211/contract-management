"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Field } from "@/types/field";
import { useToast } from "@/components/ui/toaster";
import { X, Upload, Check, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { PdfBlueprintEditor } from "@/components/pdf-blueprint-editor";
import { cn } from "@/lib/utils";

const getPdfjsLib = async () => {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
};

interface BlueprintFormProps {
  initialData?: {
    name: string;
    description?: string;
    fields: Field[];
    pdfFileName?: string;
    pdfUrl?: string;
    pageCount?: number;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    fields: Field[];
    pdfFileName?: string;
    pdfUrl?: string;
    pageCount?: number;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
  formTitle?: string;
}

export function BlueprintForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Blueprint",
  formTitle = "Create Blueprint",
}: BlueprintFormProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    fields: initialData?.fields || [] as Field[],
  });
  const [pdfFile, setPdfFile] = useState<{
    file?: File;
    fileName: string;
    url: string;
    pageCount?: number;
  } | null>(initialData?.pdfUrl ? {
    fileName: initialData.pdfFileName || "Existing Document.pdf",
    url: initialData.pdfUrl,
    pageCount: initialData.pageCount
  } : null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    if (file.type !== "application/pdf") {
      addToast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      addToast({ title: "File Too Large", description: "Max file size is 10MB.", variant: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const pdfjsLib = await getPdfjsLib();
        let pageCount;
        if (pdfjsLib) {
           const loadingTask = pdfjsLib.getDocument({ data: base64 });
           const pdf = await loadingTask.promise;
           pageCount = pdf.numPages;
        }
        setPdfFile({ file, fileName: file.name, url: base64, pageCount });
      } catch {
        setPdfFile({ file, fileName: file.name, url: base64, pageCount: undefined });
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => setIsUploading(false);
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        addToast({ title: "Required", description: "Please enter a blueprint name.", variant: "error" });
        return;
      }
      if (!pdfFile) {
        addToast({ title: "Required", description: "Please upload a document.", variant: "error" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else if (onCancel) onCancel();
  };

  const handleSubmit = async () => {
    if (formData.fields.length === 0) {
        addToast({ title: "Validation Warning", description: "Be sure to add fields before finishing.", variant: "default" });
        addToast({ title: "Required", description: "Please add at least one field in Step 2.", variant: "error" });
        return;
    }
    
    setIsSubmitting(true);
    try {
      onSubmit({
        ...formData,
        pdfFileName: pdfFile?.fileName,
        pdfUrl: pdfFile?.url,
        pageCount: pdfFile?.pageCount,
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Basic Info & Upload" },
    { id: 2, label: "Signature Placement" },
    { id: 3, label: "Review" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
       
       <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onCancel?.()}>
             <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-semibold">{formTitle}</h2>
       </div>
         <div className="flex items-center gap-2 text-sm">
            {steps.map((s, idx) => (
               <div key={s.id} className="flex items-center">
                  <div className={cn(
                     "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
                     step === s.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"
                  )}>
                     <span className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full text-xs",
                         step === s.id ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                     )}>
                        {s.id}
                     </span>
                     <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                     <div className="w-8 h-[1px] bg-border mx-1" />
                  )}
               </div>
            ))}
         </div>

         <div className="flex items-center gap-2">
           
            <Button onClick={handleNext} disabled={isSubmitting}>
               {step === 3 ? (isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish") : "Next Step"}
            </Button>
         </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
         {step === 1 && (
            <div className="space-y-6">
               <Card className="shadow-sm border-border/60">
                  <CardHeader>
                     <CardTitle className="text-base font-semibold">Blueprint Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Blueprint Name <span className="text-red-500">*</span></Label>
                        <Input 
                           placeholder="e.g. Sales Agreement" 
                           value={formData.name}
                           onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea 
                           className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                           placeholder="Describe what this blueprint is used for..."
                           value={formData.description}
                           onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>
                  </CardContent>
               </Card>

               <Card className="shadow-sm border-border/60">
                  <CardHeader>
                     <CardTitle className="text-base font-semibold">Upload Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {!pdfFile ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/30 transition-colors relative">
                           <input 
                             type="file" 
                             accept="application/pdf" 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             onChange={handlePdfUpload}
                             ref={fileInputRef}
                           />
                           <div className="flex flex-col items-center justify-center gap-4">
                              <div className="bg-muted p-4 rounded-full">
                                 <Upload className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className="font-medium">Upload your document</h4>
                                 <p className="text-sm text-muted-foreground">Drag and drop your PDF or Image file here, or click to browse</p>
                              </div>
                              <Button variant="outline" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                                 Browse Files
                              </Button>
                           </div>
                           {isUploading && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                           <div className="flex items-center gap-4">
                              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                                 <div className="h-8 w-8 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center border border-red-200 dark:border-red-800 bg-white dark:bg-black rounded">
                                    PDF
                                 </div>
                              </div>
                              <div>
                                 <p className="font-medium text-sm">{pdfFile.fileName}</p>
                                 <p className="text-xs text-muted-foreground">
                                    {pdfFile.file ? `${(pdfFile.file.size / (1024 * 1024)).toFixed(2)} MB • ` : ""} {pdfFile.pageCount || '-'} pages
                                 </p>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" onClick={handleRemovePdf}>
                              <X className="h-4 w-4" />
                           </Button>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>
         )}

         {step === 2 && pdfFile && (
            <Card className="shadow-sm border-border/60">
               <CardHeader>
                  <CardTitle className="text-base font-semibold">Signature Placement</CardTitle>
               </CardHeader>
               <CardContent>
                 <PdfBlueprintEditor
                    pdfUrl={pdfFile.url}
                    fields={formData.fields}
                    onFieldsChange={(newFields) => setFormData({ ...formData, fields: newFields })}
                 />
               </CardContent>
            </Card>
         )}

         {step === 3 && (
            <Card className="shadow-sm border-border/60">
               <CardHeader>
                  <CardTitle className="text-base font-semibold">Review & Publish</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                     <p><strong>Name:</strong> {formData.name}</p>
                     <p><strong>Description:</strong> {formData.description || "No description"}</p>
                     <p><strong>Fields:</strong> {formData.fields.length} configured</p>
                     <p><strong>File:</strong> {pdfFile?.fileName}</p>
                  </div>
                  <div className="flex justify-end">
                     <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                        Confirm & Publish
                     </Button>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
    </div>
  );
}
