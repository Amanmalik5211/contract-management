"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Blueprint } from "@/types/blueprint";
import type { Field, FieldType } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BlueprintManager() {
  const { blueprints, addBlueprint, deleteBlueprint } = useStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    fields: Field[];
  }>({
    name: "",
    description: "",
    fields: [],
  });
  const [newField, setNewField] = useState<{
    label: string;
    type: FieldType;
  }>({
    label: "",
    type: "text",
  });

  const handleAddField = () => {
    if (newField.label.trim()) {
      const field: Field = {
        id: `field-${crypto.randomUUID()}`,
        type: newField.type,
        label: newField.label,
        position: {
          x: Math.random() * 800,
          y: Math.random() * 400,
        },
        required: true,
      };

      setFormData({
        ...formData,
        fields: [...formData.fields, field],
      });

      setNewField({ label: "", type: "text" });
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((f) => f.id !== fieldId),
    });
  };

  const handleCreateBlueprint = () => {
    if (formData.name.trim() && formData.fields.length > 0) {
      const blueprint: Blueprint = {
        id: `bp-${crypto.randomUUID()}`,
        name: formData.name,
        description: formData.description,
        fields: formData.fields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addBlueprint(blueprint);
      setFormData({ name: "", description: "", fields: [] });
      setShowCreateForm(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", fields: [] });
    setNewField({ label: "", type: "text" });
    setShowCreateForm(false);
  };

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Text Input",
    date: "Date Picker",
    signature: "Signature",
    checkbox: "Checkbox",
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Blueprints</h1>
              <p className="mt-2">Create and manage contract templates</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "Create Blueprint"}
            </Button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Blueprint</CardTitle>
                <CardDescription>Define a reusable contract template with fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Blueprint Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Service Agreement"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Brief description of this template"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 break-words overflow-auto resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Add Fields */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-semibold">Add Fields</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="fieldLabel">Field Label</Label>
                      <Input
                        id="fieldLabel"
                        placeholder="e.g., Signature"
                        value={newField.label}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldType">Field Type</Label>
                      <select
                        id="fieldType"
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                        className="mt-2 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="text">Text Input</option>
                        <option value="date">Date Picker</option>
                        <option value="signature">Signature</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddField}
                        variant="outline"
                        className="w-full"
                      >
                        Add Field
                      </Button>
                    </div>
                  </div>

                  {/* Fields List */}
                  {formData.fields.length > 0 && (
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-sm font-medium">
                        {formData.fields.length} field{formData.fields.length !== 1 ? "s" : ""} added
                      </p>
                      <div className="space-y-2">
                        {formData.fields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{field.label}</p>
                              <p className="text-xs">{fieldTypeLabels[field.type]}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveField(field.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 border-t pt-4">
                  <Button
                    onClick={handleCreateBlueprint}
                    disabled={!formData.name.trim() || formData.fields.length === 0}
                    className="flex-1"
                  >
                    Create Blueprint
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blueprints List */}
          <div className="grid gap-4">
            {blueprints.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="flex h-32 items-center justify-center text-center">
                  <div>
                    <p className="font-medium">No blueprints created yet</p>
                    <p className="text-sm">Create your first blueprint to get started</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              blueprints.map((blueprint) => (
                <Card key={blueprint.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg break-words">{blueprint.name}</CardTitle>
                        {blueprint.description && (
                          <CardDescription className="mt-1 break-words overflow-hidden">{blueprint.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBlueprint(blueprint.id)}
                        className="flex-shrink-0"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">{blueprint.fields.length} fields</p>
                      <ul className="mt-2 space-y-1">
                        {blueprint.fields.map((field) => (
                          <li key={field.id} className="text-xs break-words">
                            • {field.label} ({fieldTypeLabels[field.type]})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
