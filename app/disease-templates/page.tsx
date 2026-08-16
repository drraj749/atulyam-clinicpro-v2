"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DiseaseTemplate = {
  id: number;
  name: string;
  category: string | null;
  investigations: string | null;
  advice: string | null;
  notes: string | null;
};

export default function DiseaseTemplatesPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<DiseaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTemplates() {
    try {
      const res = await fetch("/api/disease-templates");
      const data = await res.json();

      if (data.success) {
        setTemplates(data.templates);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function deleteTemplate(id: number) {
    const ok = window.confirm(
      "Are you sure you want to delete this Disease Template?"
    );

    if (!ok) return;

    try {
      const res = await fetch(`/api/disease-templates/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Disease Template deleted successfully.");

      loadTemplates();
    } catch (error) {
      console.error(error);
      alert("Unable to delete template.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Disease Templates
          </h1>

          <p className="text-gray-500 mt-1">
            Create reusable prescription templates.
          </p>
        </div>

        <button
          onClick={() => router.push("/disease-templates/new")}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
        >
          + New Template
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="text-left px-4 py-3">Template</th>

              <th className="text-left px-4 py-3">Category</th>

              <th className="text-left px-4 py-3">
                Investigations
              </th>

              <th className="text-center px-4 py-3">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && templates.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  No Disease Template Found
                </td>
              </tr>
            )}

            {templates.map((template) => (
              <tr
                key={template.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-semibold">
                  {template.name}
                </td>

                <td className="px-4 py-3">
                  {template.category || "-"}
                </td>

                <td className="px-4 py-3 whitespace-pre-line">
                  {template.investigations || "-"}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/disease-templates/${template.id}`
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTemplate(template.id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}