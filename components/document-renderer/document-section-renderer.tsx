"use client";

import type { DocumentSection } from "@/types/blueprint";
import type { Field } from "@/types/field";
import { capitalizeWords } from "@/lib/utils";

interface DocumentSectionRendererProps {
  section: DocumentSection;
  fieldsMap: Map<string, Field>;
  orderedFields: Field[];
  renderField: (field: Field) => React.ReactNode;
  renderDraggableField: (field: Field, index: number) => React.ReactNode;
}

export function DocumentSectionRenderer({
  section,
  fieldsMap,
  orderedFields,
  renderField,
  renderDraggableField,
}: DocumentSectionRendererProps) {
  switch (section.type) {
    case "section":
      return (
        <div key={section.id} className="mt-10 mb-8">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 dark:border-gray-700 pb-3 tracking-tight break-words overflow-wrap-anywhere">
            {section.title ? capitalizeWords(section.title) : "Section"}
          </h2>
          {section.content && (
            <p className="mt-4 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere text-base">
              {section.content}
            </p>
          )}
        </div>
      );
    case "text":
      return (
        <div key={section.id} className="my-6">
          {section.title && (
            <h3 className="text-lg font-semibold mb-3 tracking-tight break-words overflow-wrap-anywhere">
              {capitalizeWords(section.title)}
            </h3>
          )}
          {section.content && (
            <p className="leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere text-base">
              {section.content}
            </p>
          )}
        </div>
      );
    case "field":
      if (section.fieldId) {
        const field = fieldsMap.get(section.fieldId);
        if (field) {
          const fieldIndex = orderedFields.findIndex(f => f.id === field.id);
          return (
            <div key={section.id} className="my-6">
              {fieldIndex !== -1 ? renderDraggableField(field, fieldIndex) : renderField(field)}
            </div>
          );
        }
      }
      return null;
    default:
      return null;
  }
}

