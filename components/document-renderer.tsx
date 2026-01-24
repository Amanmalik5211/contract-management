"use client";

import React, { useState } from "react";
import type { Field } from "@/types/field";
import type { DocumentSection } from "@/types/blueprint";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";

interface DocumentRendererProps {
  title: string;
  description?: string;
  headerImageUrl?: string;
  sections: DocumentSection[];
  fields: Field[];
  fieldValues?: Record<string, string | boolean | Date | null>;
  isEditable?: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
  onFieldsReorder?: (reorderedFields: Field[]) => void;
  className?: string;
}

export function DocumentRenderer({
  title,
  description,
  headerImageUrl,
  sections,
  fields,
  fieldValues = {},
  isEditable = false,
  onFieldChange,
  onFieldsReorder,
  className = "",
}: DocumentRendererProps) {
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  
  // Create a map of fields by ID for quick lookup
  const fieldsMap = new Map(fields.map((f) => [f.id, f]));

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Drag and drop handlers for field reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditable || !onFieldsReorder) return;
    const target = e.target as HTMLElement;
    // Don't start drag if clicking on input, textarea, button, or label
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'LABEL' ||
        target.closest('input, textarea, button, label')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    setDraggedFieldIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditable || !onFieldsReorder) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isEditable || !onFieldsReorder) return;
    e.preventDefault();
    e.stopPropagation();

    const dragIndex = draggedFieldIndex ?? parseInt(e.dataTransfer.getData("text/html") || "-1");
    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggedFieldIndex(null);
      return;
    }

    const newFields = [...fields];
    const [draggedField] = newFields.splice(dragIndex, 1);
    newFields.splice(dropIndex, 0, draggedField);

    onFieldsReorder(newFields);
    setDraggedFieldIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedFieldIndex(null);
  };


  const renderField = (field: Field) => {
    const value = fieldValues[field.id] ?? "";
    const fieldId = field.id;

    if (isEditable && onFieldChange) {
      // Editable mode
      switch (field.type) {
        case "text":
          return (
            <div key={fieldId} className="space-y-2">
              <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <textarea
                id={fieldId}
                value={(value as string) || ""}
                onChange={(e) => onFieldChange(fieldId, e.target.value)}
                className="w-full min-h-[100px] rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                rows={4}
                placeholder="Enter text..."
              />
            </div>
          );
        case "date":
          return (
            <div key={fieldId} className="space-y-2">
              <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={fieldId}
                type="date"
                value={
                  value instanceof Date
                    ? format(value, "yyyy-MM-dd")
                    : (value as string) || ""
                }
                onChange={(e) => onFieldChange(fieldId, e.target.value)}
                className="w-full"
              />
            </div>
          );
        case "checkbox":
          return (
            <div key={fieldId} className="flex items-start space-x-3 py-2">
              <input
                type="checkbox"
                id={fieldId}
                checked={(value as boolean) || false}
                onChange={(e) => onFieldChange(fieldId, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor={fieldId} className="text-sm font-semibold text-gray-700 cursor-pointer">
                {capitalizeWords(field.label)}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
          );
        case "signature":
          return (
            <div key={fieldId} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                {value ? (
                  <div className="text-sm text-gray-600">Signature captured</div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onFieldChange(fieldId, "signed")}
                    className="text-sm"
                  >
                    Click to Sign
                  </Button>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    } else {
      // Read-only mode
      switch (field.type) {
        case "text":
          return (
            <div key={fieldId} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
              </Label>
              <div className="px-4 py-3 border border-gray-200 rounded-md bg-white text-sm min-h-[60px] whitespace-pre-wrap break-words">
                {value ? (
                  (value as string)
                ) : (
                  <span className="text-gray-400 italic">Not filled</span>
                )}
              </div>
            </div>
          );
        case "date":
          return (
            <div key={fieldId} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
              </Label>
              <div className="px-4 py-3 border border-gray-200 rounded-md bg-white text-sm">
                {value ? (
                  value instanceof Date
                    ? format(value, "MMMM d, yyyy")
                    : format(new Date(value as string), "MMMM d, yyyy")
                ) : (
                  <span className="text-gray-400 italic">Not filled</span>
                )}
              </div>
            </div>
          );
        case "checkbox":
          return (
            <div key={fieldId} className="flex items-center space-x-3 py-2">
              <div className="h-5 w-5 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                {(value as boolean) ? (
                  <span className="text-green-600 text-lg">✓</span>
                ) : null}
              </div>
              <Label className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
              </Label>
            </div>
          );
        case "signature":
          return (
            <div key={fieldId} className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                {capitalizeWords(field.label)}
              </Label>
              <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                {value ? (
                  <div className="text-sm text-gray-600 font-medium">✓ Signature captured</div>
                ) : (
                  <div className="text-sm text-gray-400">No signature</div>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    }
  };

  const renderSection = (section: DocumentSection) => {
    switch (section.type) {
      case "section":
        return (
          <div key={section.id} className="mt-10 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-3 tracking-tight">
              {section.title ? capitalizeWords(section.title) : "Section"}
            </h2>
            {section.content && (
              <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-base">
                {section.content}
              </p>
            )}
          </div>
        );
      case "text":
        return (
          <div key={section.id} className="my-6">
            {section.title && (
              <h3 className="text-lg font-semibold text-gray-800 mb-3 tracking-tight">
                {capitalizeWords(section.title)}
              </h3>
            )}
            {section.content && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-base">
                {section.content}
              </p>
            )}
          </div>
        );
      case "image":
        return (
          <div key={section.id} className="my-6 flex justify-center">
            {section.imageUrl ? (
              <div className="relative w-full max-w-2xl h-64">
                <img
                  src={section.imageUrl}
                  alt={section.imageAlt || section.title || "Image"}
                  className="w-full h-full object-contain rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div className="w-full max-w-2xl h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>
        );
      case "field":
        if (section.fieldId) {
          const field = fieldsMap.get(section.fieldId);
          if (field) {
            return (
              <div key={section.id} className="my-6">
                {renderField(field)}
              </div>
            );
          }
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Document Container */}
      <div className="max-w-4xl mx-auto px-10 py-14 shadow-xl border border-gray-100" style={{ minHeight: "11in" }}>
        
          {/* Document Title */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {capitalizeWords(title)}
            </h1>
          </div>

          {/* Header with Logo/Image */}
          {headerImageUrl && (
            <div className="mb-8 flex justify-center">
              <div className="relative w-full max-w-2xl h-56">
                <img
                  src={headerImageUrl}
                  alt="Document Header"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mb-12 text-center">
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed break-words whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

      

      

        {/* Document Content */}
        <div className="space-y-6 text-gray-800">
          {sortedSections.length > 0 ? (
            sortedSections.map((section) => renderSection(section))
          ) : (
            // Fallback: render all fields if no sections defined
            <div className={`space-y-6 ${isEditable && onFieldsReorder ? "pl-10" : ""}`}>
              {fields.map((field, index) => {
                const isDragging = draggedFieldIndex === index;
                const isDragOver = draggedFieldIndex !== null && draggedFieldIndex !== index;
                return (
                  <div
                    key={field.id}
                    draggable={isEditable && !!onFieldsReorder}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group ${
                      isEditable && onFieldsReorder ? "cursor-move" : ""
                    } ${
                      isDragging ? "opacity-50 scale-95" : ""
                    } ${
                      isDragOver ? "border-t-4 border-t-blue-400" : ""
                    } transition-all duration-200`}
                  >
                    {isEditable && onFieldsReorder && (
                      <div 
                        className="absolute -left-10 top-2 text-gray-400 group-hover:text-gray-600 cursor-grab active:cursor-grabbing z-10"
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={`border rounded-lg p-4 ${
                        isEditable && onFieldsReorder
                          ? "hover:border-blue-300 hover:bg-blue-50/50"
                          : ""
                      } transition-colors`}
                      onMouseDown={(e) => {
                        // Prevent drag if clicking on form elements
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || 
                            target.tagName === 'TEXTAREA' || 
                            target.tagName === 'BUTTON' ||
                            target.closest('input, textarea, button')) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {renderField(field)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Footer */}
        <div className="mt-20 pt-8 border-t-2 border-gray-200 text-center text-xs text-gray-400 font-medium">
          <p>This document was generated on {format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>
    </div>
  );
}

