import type { ReactNode } from "react";
import type * as React from "react";
import type { Contract, ContractStatus } from "./contract";
import type { Blueprint, DocumentSection } from "./blueprint";
import type { Field, FieldType } from "./field";

// Shared component props
export interface PageLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export interface SearchAndFilterProps<T extends string> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: T[];
  onClearFilters: () => void;
  searchPlaceholder?: string;
  showToggle?: boolean;
  toggleValue?: "contract" | "blueprint";
  onToggleChange?: (value: "contract" | "blueprint") => void;
  // Legacy props - kept for backward compatibility but not used
  onFilterToggle?: (filter: T) => void;
  filterOptions?: Array<{ value: T; label: string }>;
  filterLabel?: string;
}

export interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: "contract" | "blueprint";
  onConfirm: () => void;
  isDeleting?: boolean;
}

// Contract component props
export interface ContractHeaderProps {
  contract: Contract;
  canEdit: boolean;
  isCreated: boolean;
  isLocked: boolean;
  isRevoked: boolean;
  hasUnsavedChanges: boolean;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
}

export interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  onStatusChange?: (id: string, status: ContractStatus) => void;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  getStatusLabel: (status: string) => string;
}

export interface ContractDocumentSectionProps {
  contract: Contract;
  isEditable?: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
}

export interface ContractCreationCardProps {
  onBlueprintSelect: (blueprintId: string) => void;
  selectedBlueprintId?: string;
}

export interface ContractCreationFormContentProps {
  blueprint: Blueprint;
  onFieldChange: (fieldId: string, value: string | boolean | Date | null) => void;
  fieldValues: Record<string, string | boolean | Date | null>;
  errors?: Record<string, string>;
}

export interface ContractsPageHeaderProps {
  totalContracts: number;
}

export interface NewContractFormCardProps {
  onBlueprintSelect: (blueprintId: string) => void;
  selectedBlueprintId?: string;
  onFieldChange: (fieldId: string, value: string | boolean | Date | null) => void;
  fieldValues: Record<string, string | boolean | Date | null>;
  errors?: Record<string, string>;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export interface BlueprintSelectFieldProps {
  blueprints: Blueprint[];
  selectedBlueprintId?: string;
  onSelect: (blueprintId: string) => void;
  error?: string;
}

export interface BlueprintPreviewProps {
  blueprint: Blueprint;
}

export interface ContractFormHeaderProps {
  title: string;
  description?: string;
}

export interface ContractFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export interface ContractActionsSectionProps {
  contract: Contract;
  canEdit: boolean;
  isCreated: boolean;
  onStatusChange?: (newStatus: ContractStatus) => void;
  onDelete?: () => void;
  onDownload?: () => void;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
}

export interface ContractStatusHeaderProps {
  contract: Contract;
}

export interface RevokeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contractName: string;
}

export interface StatusAlertProps {
  status: ContractStatus;
}

export interface StatusFlowDisplayProps {
  currentStatus: ContractStatus;
  onStatusChange?: (newStatus: ContractStatus) => void;
  canTransitionTo: (from: ContractStatus, to: ContractStatus) => boolean;
}

export interface StatusActionsProps {
  contract: Contract;
  onStatusChange?: (newStatus: ContractStatus) => void;
  canTransitionTo: (from: ContractStatus, to: ContractStatus) => boolean;
}

export interface ContractStatusCardProps {
  status: ContractStatus;
  onStatusChange?: (newStatus: ContractStatus) => void;
  canTransitionTo: (from: ContractStatus, to: ContractStatus) => boolean;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
}

export interface StatusManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  onStatusChange: (newStatus: ContractStatus) => void;
  canTransitionTo: (from: ContractStatus, to: ContractStatus) => boolean;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
}

export interface DownloadWarningsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warnings: {
    overlappingFieldLabels: string[];
    unfilledFieldLabels: string[];
  };
  onConfirm: () => void;
}

// Blueprint component props
export interface BlueprintCardProps {
  blueprint: Blueprint;
  fieldTypeLabels: Record<FieldType, string>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface FieldListProps {
  fields: Field[];
  fieldTypeLabels: Record<FieldType, string>;
  onEdit?: (fieldId: string) => void;
  onDelete?: (fieldId: string) => void;
}

export interface BlueprintPreviewSectionProps {
  blueprint: Blueprint;
  fieldTypeLabels: Record<FieldType, string>;
}

export interface BlueprintHeaderProps {
  blueprint: Blueprint;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export interface BlueprintEditFormProps {
  blueprint: Blueprint;
  onSave: (updates: Partial<Blueprint>) => void;
  onCancel: () => void;
  fieldTypeLabels: Record<FieldType, string>;
}

export interface AddFieldFormProps {
  onAdd: (field: Omit<Field, "id">) => void;
  onCancel: () => void;
  fieldTypeLabels: Record<FieldType, string>;
}

export interface BlueprintFormProps {
  blueprint?: Blueprint;
  onSubmit: (blueprint: Omit<Blueprint, "id" | "createdAt" | "updatedAt">) => void;
  onCancel?: () => void;
  fieldTypeLabels: Record<FieldType, string>;
}

// Dashboard component props
export interface KPIIconContainerProps {
  icon: ReactNode;
  className?: string;
}

export interface KPIChangeIndicatorProps {
  value: number;
  isPositive?: boolean;
  className?: string;
}

export interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  icon?: ReactNode;
}

export interface KPICardsProps {
  data: KPIData[];
}

export interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  icon?: ReactNode;
}

export interface ComparisonPieChartProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  className?: string;
}

export interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export interface DistributionChartProps {
  contracts: Contract[];
  className?: string;
}

export interface DashboardGraphsSectionProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  className?: string;
}

export interface ItemsOverTimeChartProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  className?: string;
}

export interface DashboardGraphsHeaderProps {
  title: string;
}

export interface ContractsListSectionProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  onStatusChange?: (id: string, status: ContractStatus) => void;
  onContractClick?: (contract: Contract) => void;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  getStatusLabel: (status: string) => string;
}

export interface ContractsListHeaderProps {
  totalContracts: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface ContractTableRowProps {
  contract: Contract;
  onClick?: () => void;
  onStatusChange?: (id: string, status: ContractStatus) => void;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  getStatusLabel: (status: string) => string;
}

export interface StatusChangeModalInlineProps {
  contract: Contract;
  onStatusChange: (id: string, status: ContractStatus) => void;
  canTransitionTo: (from: ContractStatus, to: ContractStatus) => boolean;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
}

export interface EmptyStateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface BlueprintTableRowProps {
  blueprint: Blueprint;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  fieldTypeLabels: Record<FieldType, string>;
}

export interface FilterSectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export interface ContractsTableProps {
  contracts: Contract[];
  onContractClick?: (contract: Contract) => void;
  onStatusChange?: (id: string, status: ContractStatus) => void;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  getStatusLabel: (status: string) => string;
}

// Document renderer component props
import type { DocumentSection } from "./blueprint";

export interface DocumentRendererProps {
  title: string;
  sections: DocumentSection[];
  fields: Field[];
  fieldValues?: Record<string, string | boolean | Date | null>;
  isEditable?: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
  onFieldsReorder?: (reorderedFields: Field[]) => void;
  className?: string;
}

export interface DocumentSectionRendererProps {
  section: DocumentSection;
  fields: Field[];
  fieldValues?: Record<string, string | boolean | Date | null>;
  isEditable?: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
}

export interface DraggableFieldWrapperProps {
  field: Field;
  children: ReactNode;
  onDragStart?: (fieldId: string) => void;
  onDragEnd?: () => void;
}

export interface ReadOnlyFieldRendererProps {
  field: Field;
  value: string | boolean | Date | null;
}

export interface EditableFieldRendererProps {
  field: Field;
  value: string | boolean | Date | null;
  onChange: (value: string | boolean) => void;
}

// PDF editor component props
export interface PdfBlueprintEditorProps {
  pdfUrl: string;
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  className?: string;
}

export interface FieldTypeSelectorProps {
  selectedFieldType: FieldType;
  onFieldTypeChange: (type: FieldType) => void;
  isPlacingField: boolean;
  onTogglePlacingField: () => void;
  onCancelPlacing: () => void;
  overlappingFieldsCount: number;
  fieldTypeLabels: Record<FieldType, string>;
}

export interface FieldOverlayProps {
  field: Field;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  hasOverlap: boolean;
  hasPdfTextOverlap: boolean;
  isPlacingField: boolean;
  onDragStart: (e: React.PointerEvent, fieldId: string) => void;
  onResizeStart: (e: React.PointerEvent, fieldId: string) => void;
  onSelect: (fieldId: string) => void;
  onLabelChange: (fieldId: string, label: string) => void;
  onDelete: (fieldId: string) => void;
  fieldRef: (el: HTMLDivElement | null) => void;
}

export interface PdfPageRendererProps {
  pageNum: number;
  numPages: number;
  imageData: string;
  width: number;
  height: number;
  pageFields: Field[];
  isPlacingField: boolean;
  selectedField: string | null;
  overlappingFields: Set<string>;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldLabelChange: (fieldId: string, label: string) => void;
  onDragStart: (e: React.PointerEvent, fieldId: string) => void;
  onResizeStart: (e: React.PointerEvent, fieldId: string) => void;
  fieldRef: (fieldId: string, el: HTMLDivElement | null) => void;
}

export interface FieldsListProps {
  fields: Field[];
  selectedField: string | null;
  overlappingFields: Set<string>;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
}

export interface ContractPageRowProps {
  pdfUrl: string;
  pageNumber: number;
  fields: Field[];
  fieldValues: Record<string, string | boolean | Date | null>;
  isEditable?: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
  onPageRef?: (pageNum: number, element: HTMLDivElement | null) => void;
}

export interface EditableTextFieldProps {
  field: Field;
  value: string | null;
  onChange: (value: string) => void;
  pageWidth: number;
  pageHeight: number;
  isOverlapping?: boolean;
}

export interface EditableDateFieldProps {
  field: Field;
  value: Date | null;
  onChange: (value: Date | null) => void;
  pageWidth: number;
  pageHeight: number;
  isOverlapping?: boolean;
}

export interface EditableSignatureFieldProps {
  field: Field;
  value: boolean;
  onChange: (value: boolean) => void;
  pageWidth: number;
  pageHeight: number;
  isOverlapping?: boolean;
}

export interface EditableCheckboxFieldProps {
  field: Field;
  value: boolean;
  onChange: (value: boolean) => void;
  pageWidth: number;
  pageHeight: number;
  isOverlapping?: boolean;
}

export interface ReadOnlyFieldRendererProps {
  field: Field;
  value: string | boolean | Date | null;
  pageWidth: number;
  pageHeight: number;
}

export interface FieldsListPanelProps {
  fields: Field[];
  selectedFieldId?: string;
  onSelectField?: (fieldId: string) => void;
  fieldTypeLabels: Record<FieldType, string>;
}

export interface OverflowWarningBannerProps {
  overlappingFields: Field[];
  onDismiss?: () => void;
}

// PDF viewer component props
export interface PdfPageProps {
  pageNum: number;
  numPages: number;
  imageData: string | null;
  onPageRef?: (pageNum: number, element: HTMLDivElement | null) => void;
}

export interface PdfLoadingStateProps {
  className?: string;
}

export interface PdfErrorStateProps {
  error: string;
  className?: string;
}

