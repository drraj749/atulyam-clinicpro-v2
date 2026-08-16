"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
  totalPatients: 0,
  todayOPD: 0,
  totalMedicines: 0,
  totalTemplates: 0,
});

const [loadingStats, setLoadingStats] =
  useState(true);

useEffect(() => {
  async function loadStats() {
    try {
      const res = await fetch(
        "/api/dashboard/stats",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error(
        "Dashboard stats error:",
        error
      );
    } finally {
      setLoadingStats(false);
    }
  }

  loadStats();
}, []);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================
          TOP HEADER
      ========================= */}

      <header className="bg-white border-b">

        <div className="px-6 md:px-8 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-blue-950">
              Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Atulyam Hospital • Doctor OPD System
            </p>
          </div>

          <div className="hidden md:block text-right">

            <p className="font-semibold text-gray-800">
              Dr. Rahul Kumar
            </p>

            <p className="text-sm text-gray-500">
              Consultant Physician
            </p>

          </div>

        </div>

      </header>

      {/* =========================
          DASHBOARD CONTENT
      ========================= */}

      <main className="p-6 md:p-8">

        {/* Welcome */}

        <div className="mb-8">

          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to Atulyam Hospital
          </h2>

          <p className="text-gray-500 mt-1">
            Manage your patients and consultations from one place.
          </p>

        </div>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <section className="mb-8">

          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl">

            {/* NEW OPD */}

            <button
              type="button"
              onClick={() =>
                router.push("/opd/new")
              }
              className="group bg-blue-700 hover:bg-blue-800 text-white rounded-2xl p-7 text-left shadow-sm transition"
            >

              <div className="flex items-center gap-5">

                <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-3xl">
                  ➕
                </div>

                <div>

                  <h4 className="text-xl font-bold">
                    New OPD
                  </h4>

                  <p className="text-blue-100 text-sm mt-1">
                    Start a new patient consultation
                  </p>

                </div>

              </div>

            </button>

            {/* FOLLOW UP */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/opd/follow-up"
                )
              }
              className="group bg-green-600 hover:bg-green-700 text-white rounded-2xl p-7 text-left shadow-sm transition"
            >

              <div className="flex items-center gap-5">

                <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-3xl">
                  🔄
                </div>

                <div>

                  <h4 className="text-xl font-bold">
                    Follow-Up OPD
                  </h4>

                  <p className="text-green-100 text-sm mt-1">
                    Continue an existing patient's treatment
                  </p>

                </div>

              </div>

            </button>
{/* TODAY'S OPD */}

<button
  type="button"
  onClick={() =>
    router.push("/opd/today")
  }
  className="group bg-purple-700 hover:bg-purple-800 text-white rounded-2xl p-7 text-left shadow-sm transition"
>

  <div className="flex items-center gap-5">

    <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-3xl">
      📋
    </div>

    <div>

      <h4 className="text-xl font-bold">
        Today's OPD
      </h4>

      <p className="text-purple-100 text-sm mt-1">
        View today's patient consultations
      </p>

    </div>

  </div>

</button>
          </div>

        </section>

        {/* =========================
            OVERVIEW
        ========================= */}

        <section className="mb-8">

          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Hospital Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* PATIENTS */}

            <button
              type="button"
              onClick={() =>
                router.push("/patients")
              }
              className="bg-white rounded-2xl border p-5 text-left hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Patients
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-2">
  {loadingStats
    ? "..."
    : stats.totalPatients}
</p>

                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                  👥
                </div>

              </div>

              <p className="text-xs text-gray-400 mt-4">
                View patient records
              </p>

            </button>

            {/* OPD */}

            <button
              type="button"
              onClick={() =>
                router.push("/opd/select")
              }
              className="bg-white rounded-2xl border p-5 text-left hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    OPD
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-2">
  {loadingStats
    ? "..."
    : stats.todayOPD}
</p>

                </div>

                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                  🏥
                </div>

              </div>

              <p className="text-xs text-gray-400 mt-4">
                Today's OPD visits
              </p>

            </button>

            {/* MEDICINES */}

            <button
              type="button"
              onClick={() =>
                router.push("/medicines")
              }
              className="bg-white rounded-2xl border p-5 text-left hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Medicines
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-2">
  {loadingStats
    ? "..."
    : stats.totalMedicines}
</p>

                </div>

                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                  💊
                </div>

              </div>

              <p className="text-xs text-gray-400 mt-4">
                Medicine master
              </p>

            </button>

            {/* TEMPLATES */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/disease-templates"
                )
              }
              className="bg-white rounded-2xl border p-5 text-left hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Templates
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mt-2">
  {loadingStats
    ? "..."
    : stats.totalTemplates}
</p>

                </div>

                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                  📋
                </div>

              </div>

              <p className="text-xs text-gray-400 mt-4">
                Disease templates
              </p>

            </button>

          </div>

        </section>

        {/* =========================
            MANAGEMENT
        ========================= */}

        <section>

          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Quick Management
          </h3>

          <div className="bg-white rounded-2xl border p-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* PATIENTS */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/patients"
                  )
                }
                className="flex items-center gap-4 p-4 rounded-xl border hover:bg-blue-50 transition text-left"
              >

                <span className="text-2xl">
                  👥
                </span>

                <div>

                  <p className="font-semibold text-gray-800">
                    Patient Records
                  </p>

                  <p className="text-xs text-gray-500">
                    Search and manage patients
                  </p>

                </div>

              </button>

              {/* DISEASE TEMPLATES */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/disease-templates"
                  )
                }
                className="flex items-center gap-4 p-4 rounded-xl border hover:bg-blue-50 transition text-left"
              >

                <span className="text-2xl">
                  📋
                </span>

                <div>

                  <p className="font-semibold text-gray-800">
                    Disease Templates
                  </p>

                  <p className="text-xs text-gray-500">
                    Manage treatment templates
                  </p>

                </div>

              </button>

              {/* REPORTS */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/reports"
                  )
                }
                className="flex items-center gap-4 p-4 rounded-xl border hover:bg-blue-50 transition text-left"
              >

                <span className="text-2xl">
                  📊
                </span>

                <div>

                  <p className="font-semibold text-gray-800">
                    Reports
                  </p>

                  <p className="text-xs text-gray-500">
                    View hospital reports
                  </p>

                </div>

              </button>

            </div>

          </div>

        </section>

        {/* =========================
            FOOTER
        ========================= */}

        <div className="text-center mt-10 pb-4 text-sm text-gray-400">
          Atulyam Hospital • Born To Serve
        </div>

      </main>

    </div>
  );
}