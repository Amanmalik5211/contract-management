"use client";

import { DocumentRenderer } from "@/components/document-renderer";
import { PdfContractEditor } from "@/components/pdf-contract-editor";
import type { Field } from "@/types/field";
import type { Contract } from "@/types/contract";

interface ContractDocumentSectionProps {
  contract: Contract;
  fields: Field[];
  fieldValues: Record<string, string | boolean | Date | null>;
  isEditable: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
  onFieldsReorder?: (fields: Field[]) => void;
}

export function ContractDocumentSection({
  contract,
  fields,
  fieldValues,
  isEditable,
  onFieldChange,
  onFieldsReorder,
}: ContractDocumentSectionProps) {
  return (
    <section className="mb-6 sm:mb-8 md:mb-10 w-full max-w-full overflow-x-hidden">
      <div className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-2 sm:p-4 md:p-6 lg:p-8 overflow-visible w-full">
        {contract.pdfUrl ? (
          <PdfContractEditor
            pdfUrl={contract.pdfUrl}
            fields={fields}
            fieldValues={fieldValues}
            isEditable={isEditable}
            onFieldChange={onFieldChange}
            onFieldsReorder={onFieldsReorder}
          />
        ) : (
          <DocumentRenderer
            title={contract.name}
            sections={[]}
            fields={fields}
            fieldValues={fieldValues}
            isEditable={isEditable}
            onFieldChange={onFieldChange}
            onFieldsReorder={onFieldsReorder}
          />
        )}
      </div>
    </section>
  );
}

