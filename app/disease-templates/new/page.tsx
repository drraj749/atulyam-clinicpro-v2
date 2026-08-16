"use client";

import DiseaseTemplateEditor from "@/app/components/disease-template/DiseaseTemplateEditor";

export default function NewDiseaseTemplatePage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Create Disease Template
      </h1>

      <DiseaseTemplateEditor mode="create" />
    </div>
  );
}