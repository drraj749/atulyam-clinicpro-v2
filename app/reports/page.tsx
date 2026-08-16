"use client";

import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";

type ReportResponse = {
  success: boolean;

  summary: {
    totalPatients: number;
    totalPrescriptions: number;
    totalMedicines: number;
    totalOpd: number;
    totalCollection: number;
  };

  opdReport: {
    id: number;
    opdNo: string;
    patientName: string;
    age: number;
    gender: string;
    mobile: string;
    doctor: string;
    department: string;
    diagnosis: string | null;
    fee: number;
    paymentMode: string;
    date: string;
  }[];
};

export default function ReportsPage() {
  const today =
    new Date().toISOString().split("T")[0];

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const [loading, setLoading] =
    useState(true);

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/reports?from=${from}&to=${to}`
      );

      const data = await res.json();

      if (data.success) {
        setReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function printReport() {
    window.print();
  }

  return (
    <main className="p-8">

      {/* PAGE HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold text-blue-900">
            Reports Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            OPD Summary & Collection Report
          </p>

        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={printReport}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
          >
            Print Report
          </button>

        </div>

      </div>

      {/* DATE FILTER */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <div className="grid md:grid-cols-4 gap-4">

          <div>

            <label className="block mb-2 font-medium">
              From Date
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
              className="border rounded-lg w-full p-3"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              To Date
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
              className="border rounded-lg w-full p-3"
            />

          </div>

          <div className="flex items-end">

            <button
              type="button"
              onClick={loadReport}
              className="bg-blue-700 hover:bg-blue-800 text-white w-full rounded-lg py-3"
            >
              Load Report
            </button>

          </div>

        </div>

      </div>

      {/* REPORT */}

      {loading ? (

        <div className="bg-white rounded-xl shadow p-12 text-center text-lg">
          Loading Report...
        </div>

      ) : (

        <>

          {/* SUMMARY CARDS */}

          <div className="grid xl:grid-cols-5 md:grid-cols-2 gap-6">

            <DashboardCard
              title="Patients"
              value={String(
                report?.summary
                  .totalPatients ?? 0
              )}
              color="#2563eb"
            />

            <DashboardCard
              title="OPD Visits"
              value={String(
                report?.summary
                  .totalOpd ?? 0
              )}
              color="#16a34a"
            />

            <DashboardCard
              title="Prescriptions"
              value={String(
                report?.summary
                  .totalPrescriptions ?? 0
              )}
              color="#9333ea"
            />

            <DashboardCard
              title="Medicines"
              value={String(
                report?.summary
                  .totalMedicines ?? 0
              )}
              color="#ea580c"
            />

            <DashboardCard
              title="Collection"
              value={`₹${
                report?.summary
                  .totalCollection ?? 0
              }`}
              color="#dc2626"
            />

          </div>

          {/* OPD TABLE */}

          <div className="bg-white rounded-xl shadow mt-8 overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-blue-900 text-white">

                  <th className="p-3 text-left">
                    OPD No
                  </th>

                  <th className="p-3 text-left">
                    Patient
                  </th>

                  <th className="p-3 text-left">
                    Age
                  </th>

                  <th className="p-3 text-left">
                    Gender
                  </th>

                  <th className="p-3 text-left">
                    Mobile
                  </th>

                  <th className="p-3 text-left">
                    Doctor
                  </th>

                  <th className="p-3 text-left">
                    Department
                  </th>

                  <th className="p-3 text-left">
                    Diagnosis
                  </th>

                  <th className="p-3 text-left">
                    Fee
                  </th>

                  <th className="p-3 text-left">
                    Payment
                  </th>

                </tr>

              </thead>

              <tbody>

                {report?.opdReport.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={10}
                      className="text-center py-10 text-gray-500"
                    >
                      No records found.
                    </td>

                  </tr>

                )}

                {report?.opdReport.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3 font-medium">
                        {item.opdNo}
                      </td>

                      <td className="p-3">
                        {item.patientName}
                      </td>

                      <td className="p-3">
                        {item.age}
                      </td>

                      <td className="p-3">
                        {item.gender}
                      </td>

                      <td className="p-3">
                        {item.mobile}
                      </td>

                      <td className="p-3">
                        {item.doctor}
                      </td>

                      <td className="p-3">
                        {item.department}
                      </td>

                      <td className="p-3">
                        {item.diagnosis ??
                          "-"}
                      </td>

                      <td className="p-3">
                        ₹{item.fee}
                      </td>

                      <td className="p-3">
                        {item.paymentMode ||
                          "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

              <tfoot>

                <tr className="bg-gray-100 font-bold">

                  <td
                    colSpan={8}
                    className="text-right p-4"
                  >
                    Total Collection
                  </td>

                  <td
                    colSpan={2}
                    className="text-left p-4 text-green-700"
                  >
                    ₹
                    {(
                      report?.summary
                        .totalCollection ??
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                </tr>

              </tfoot>

            </table>

          </div>

        </>

      )}

    </main>
  );
}