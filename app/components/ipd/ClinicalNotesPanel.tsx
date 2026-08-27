"use client";

import { FormEvent, useEffect, useState } from "react";

type ClinicalNote = {
  id: number;
  admissionId: number;
  noteType: string;
  note: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type ClinicalNotesPanelProps = {
  admissionId: number;
  admissionStatus: string;
};

export default function ClinicalNotesPanel({
  admissionId,
  admissionStatus,
}: ClinicalNotesPanelProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [noteType, setNoteType] = useState("Progress");
  const [note, setNote] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isDischarged =
    admissionStatus === "Discharged";

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/ipd/admissions/${admissionId}/clinical-notes`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load clinical notes."
        );
      }

      setNotes(data.notes || []);
    } catch (error) {
      console.error(
        "LOAD CLINICAL NOTES ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load clinical notes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [admissionId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isDischarged) {
      setError(
        "Clinical notes cannot be added after discharge."
      );

      return;
    }

    if (!note.trim()) {
      setError(
        "Please enter the clinical note."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/ipd/admissions/${admissionId}/clinical-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            noteType,
            note: note.trim(),
            createdBy:
              createdBy.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save clinical note."
        );
      }

      setNote("");
      setCreatedBy("");

      setSuccessMessage(
        "Clinical note saved successfully."
      );

      await loadNotes();
    } catch (error) {
      console.error(
        "SAVE CLINICAL NOTE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save clinical note."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Clinical Notes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add progress notes, doctor notes, nursing
            notes and other clinical updates.
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            isDischarged
              ? "bg-gray-200 text-gray-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {isDischarged
            ? "Admission Discharged"
            : "Admission Active"}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}

          <button
            type="button"
            onClick={() => {
              setError("");
              loadNotes();
            }}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {!isDischarged && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border bg-gray-50 p-5"
        >
          <h3 className="text-lg font-bold text-gray-900">
            Add New Clinical Note
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Note Type
              </label>

              <select
                value={noteType}
                onChange={(event) =>
                  setNoteType(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Progress">
                  Progress Note
                </option>

                <option value="Doctor">
                  Doctor Note
                </option>

                <option value="Nursing">
                  Nursing Note
                </option>

                <option value="Observation">
                  Observation
                </option>

                <option value="Emergency">
                  Emergency Note
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Created By
              </label>

              <input
                type="text"
                value={createdBy}
                onChange={(event) =>
                  setCreatedBy(
                    event.target.value
                  )
                }
                placeholder="Dr / Nurse name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Clinical Note
            </label>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              rows={5}
              placeholder="Enter patient progress, treatment updates, observations, complaints or other clinical details..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Clinical Note"}
            </button>
          </div>
        </form>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Clinical History
          </h3>

          <span className="text-sm text-gray-500">
            {notes.length} Note
            {notes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-gray-50 p-6 text-gray-500">
            Loading clinical notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-gray-50 p-8 text-center">
            <p className="font-semibold text-gray-700">
              No clinical notes found.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Add the first clinical note for this
              admission.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((clinicalNote) => (
              <article
                key={clinicalNote.id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      {clinicalNote.noteType}
                    </span>

                    <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-800">
                      {clinicalNote.note}
                    </p>
                  </div>

                  <div className="shrink-0 text-sm text-gray-500 md:text-right">
                    <p>
                      {new Date(
                        clinicalNote.createdAt
                      ).toLocaleString()}
                    </p>

                    {clinicalNote.createdBy && (
                      <p className="mt-1 font-medium text-gray-700">
                        By:{" "}
                        {clinicalNote.createdBy}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}