"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/toaster";
import { PageLayout } from "@/components/shared/page-layout";
import { BlueprintHeader } from "@/components/blueprints/blueprint-header";
import { BlueprintPreviewSection } from "@/components/blueprints/blueprint-preview-section";
import { BlueprintForm } from "@/components/blueprints/blueprint-form";
import { BlueprintNotFound } from "@/components/blueprints/blueprint-not-found";

function BlueprintViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getBlueprint, updateBlueprint } = useStore();
  const { addToast } = useToast();
  const blueprint = getBlueprint(params.id as string);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isEditMode = searchParams.get("edit") === "true";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);



        if (isInitialLoad) {
    return (
      <PageLayout isLoading={true} loadingText="Loading blueprint...">
        <div></div>
      </PageLayout>
    );
  }

  if (!blueprint) {
    return (
      <PageLayout>
        <BlueprintNotFound />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-8 sm:mb-12">
        <BlueprintHeader blueprint={blueprint} isEditMode={isEditMode} />
      </div>

      {!isEditMode ? (
        <>
          <BlueprintPreviewSection blueprint={blueprint} />

          <section className="py-6 sm:py-8">
            <div className="flex justify-end">
              <Link href={`/contracts/new?blueprintId=${blueprint.id}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  Create Contract from This Blueprint
                </Button>
              </Link>
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-8">
          <BlueprintForm
            initialData={{
               name: blueprint.name,
               description: blueprint.description,
               fields: blueprint.fields || [],
               pdfFileName: blueprint.pdfFileName,
               pdfUrl: blueprint.pdfUrl,
               pageCount: blueprint.pageCount
            }}
            onSubmit={(data) => {
               updateBlueprint(blueprint.id, {
                 name: data.name,
                 description: data.description,
                 fields: data.fields,
               });
               addToast({
                 title: "Blueprint Updated",
                 description: `"${data.name}" has been updated successfully.`,
                 variant: "success",
               });
               router.push("/blueprints"); 
            }}
            onCancel={() => {
               const params = new URLSearchParams(searchParams.toString());
               params.delete("edit");
               router.replace(`/blueprints/${blueprint.id}?${params.toString()}`);
            }}
            submitLabel="Update Blueprint"
            formTitle="Edit Blueprint"
          />
        </div>
      )}
    </PageLayout>
  );
}

export default function BlueprintViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
      <BlueprintViewPageContent />
    </Suspense>
  );
}

