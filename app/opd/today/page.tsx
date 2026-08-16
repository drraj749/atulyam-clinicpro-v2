"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OPDVisit = {
  id: number;
  opdNo: string;
  doctor?: string;
  department?: string;
  diagnosis?: string;
  complaint?: string;
  fee?: number | null;
  paymentMode?: string;
  createdAt: string;

  patient: {
    patientId: string;
    firstName: string;
    lastName?: string | null;
    age: number;
    gender: string;
    mobile?: string;
  };

  prescription?: {
    id: number;
  } | null;
};

export default function TodayOPDPage() {
  const router = useRouter();

  const [visits, setVisits] = useState<OPDVisit[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVisits() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/opd/today",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            "Unable to load today's OPD."
        );
        return;
      }

      setVisits(data.visits || []);
    } catch (error) {
      console.error(
        "Today's OPD error:",
        error
      );

      alert(
        "Unable to load today's OPD."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVisits();
  }, []);

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-white border-b">

        <div className="px-6 md:px-8 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-blue-950">
              Today's OPD
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Today's patient consultations
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/opd/select")
            }
            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            + New OPD
          </button>

        </div>

      </header>

      {/* CONTENT */}

      <main className="p-6 md:p-8">

        {/* SUMMARY */}

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-sm text-gray-500">
                Date
              </p>

              <p className="text-xl font-bold text-gray-800">
                {visits.length > 0
                  ? formatDate(
                      visits[0].createdAt
                    )
                  : new Date().toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
              </p>

            </div>

            <div className="bg-blue-50 rounded-xl px-6 py-4">

              <p className="text-sm text-blue-600">
                Total OPD Today
              </p>

              <p className="text-3xl font-bold text-blue-900">
                {loading
                  ? "..."
                  : visits.length}
              </p>

            </div>

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="bg-white rounded-2xl border p-10 text-center text-gray-500">
            Loading today's OPD...
          </div>
        )}

        {/* EMPTY */}

        {!loading && visits.length === 0 && (
          <div className="bg-white rounded-2xl border p-12 text-center">

            <div className="text-5xl mb-4">
              📋
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No OPD visits today
            </h2>

            <p className="text-gray-500 mt-2">
              No consultation has been registered today.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/opd/select")
              }
              className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Start New OPD
            </button>

          </div>
        )}

        {/* TABLE */}

        {!loading && visits.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-blue-950 text-white">

                  <tr>

                    <th className="text-left px-4 py-4">
                      S.No.
                    </th>

                    <th className="text-left px-4 py-4">
                      OPD No.
                    </th>

                    <th className="text-left px-4 py-4">
                      Patient
                    </th>

                    <th className="text-left px-4 py-4">
                      UHID
                    </th>

                    <th className="text-left px-4 py-4">
                      Age / Gender
                    </th>

                    <th className="text-left px-4 py-4">
                      Complaint
                    </th>

                    <th className="text-left px-4 py-4">
                      Diagnosis
                    </th>

                    <th className="text-left px-4 py-4">
                      Time
                    </th>

                    <th className="text-center px-4 py-4">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {visits.map(
                    (visit, index) => (

                      <tr
                        key={visit.id}
                        className="border-b hover:bg-slate-50"
                      >

                        <td className="px-4 py-4 font-semibold">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 font-semibold text-blue-800 whitespace-nowrap">
                          {visit.opdNo}
                        </td>

                        <td className="px-4 py-4">

                          <div className="font-semibold text-gray-800">
                            {visit.patient.firstName}{" "}
                            {visit.patient.lastName || ""}
                          </div>

                          <div className="text-xs text-gray-500">
                            {visit.patient.mobile}
                          </div>

                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {visit.patient.patientId}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {visit.patient.age} /{" "}
                          {visit.patient.gender}
                        </td>

                        <td className="px-4 py-4 max-w-[220px]">
                          <div className="line-clamp-2">
                            {visit.complaint ||
                              "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 max-w-[220px]">
                          <div className="line-clamp-2 font-medium">
                            {visit.diagnosis ||
                              "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatTime(
                            visit.createdAt
                          )}
                        </td>

                        <td className="px-4 py-4">

                          <div className="flex items-center justify-center gap-2">

                            {/* VIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/opd/view/${visit.id}`
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                            >
                              View
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/opd?patientId=${visit.patient.patientId}&visitId=${visit.id}`
                                )
                              }
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                            >
                              Edit
                            </button>

                            {/* PRESCRIPTION */}

                            {visit.prescription?.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/prescriptions/${visit.prescription!.id}/print`
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                              >
                                Print
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}