"use client";

import { use } from "react";
import DiseaseTemplateEditor from "@/app/components/disease-template/DiseaseTemplateEditor";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditDiseaseTemplatePage({
  params,
}: Props) {
  const { id } = use(params);

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Edit Disease Template
      </h1>

      <DiseaseTemplateEditor
        mode="edit"
        templateId={Number(id)}
      />

    </div>
  );
}