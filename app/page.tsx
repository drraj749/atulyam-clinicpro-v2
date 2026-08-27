"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type RecentAdmission = {
  id: number;
  ipdNo: string;
  admissionDate: string;
  status: string;
  provisionalDiagnosis: string | null;

  patient: {
    firstName: string;
    lastName: string | null;
    patientId: string;
  };

  bed: {
    bedNumber: string;

    ward: {
      name: string;
      code: string;
    };
  } | null;
};

type RecentOpdVisit = {
  id: number;
  opdNo?: string;
  visitNo?: string;
  createdAt?: string;
  visitDate?: string;
  diagnosis?: string | null;

  patient?: {
    firstName: string;
    lastName: string | null;
    patientId: string;
  };
};

type RecentLabOrder = {
  id: number;
  createdAt?: string;
  orderDate?: string;
  status?: string;

  patient?: {
    firstName: string;
    lastName: string | null;
    patientId: string;
  };
};

type ClinicalActivity = {
  id: string;
  type: string;
  title: string;
  reference: string;
  patientName: string;
  patientId: string;
  description: string | null;
  date: string;
  href: string;
};

type IpdOverview = {
  activeIPD: number;
  availableBeds: number;
  todayAdmissions: number;
  todayDischarges: number;
  recentAdmissions: RecentAdmission[];
};

type OpdOverview = {
  totalToday: number;
  newPatients: number;
  followUpPatients: number;
  recentVisits: RecentOpdVisit[];
};

type LabOverview = {
  pendingOrders: number;
  collectedToday: number;
  reportedToday: number;
  recentOrders: RecentLabOrder[];
};

type HospitalAlert = {
  id: string;
  title: string;
  count: number;
  description: string;
  href: string;
  level: string;
};

type WeeklyFlow = {
  date: string;
  label: string;
  opd: number;
  admissions: number;
  discharges: number;
};

type OperationsOverview = {
  staff: {
    totalActiveStaff: number;
    presentStaff: number;
    absentStaff: number;
    leaveStaff: number;
    checkedInStaff: number;
    notMarkedStaff: number;
  };

  revenue: {
    opdCollection: number;
    ipdCollection: number;
    laboratoryCollection: number;
    totalCollection: number;
  };

  alerts: HospitalAlert[];

  outstanding: {
    admissions: number;
    amount: number;
  };

  weeklyFlow: WeeklyFlow[];
};

function getPatientName(
  patient?: {
    firstName: string;
    lastName: string | null;
  } | null
) {
  if (!patient) {
    return "Unknown Patient";
  }

  return `${patient.firstName || ""} ${
    patient.lastName || ""
  }`.trim();
}

function formatDate(
  dateValue?: string
) {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  dateValue?: string
) {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value || 0);
}

export default function DashboardPage() {
  const [
    ipdOverview,
    setIpdOverview,
  ] =
    useState<IpdOverview | null>(
      null
    );

  const [
    opdOverview,
    setOpdOverview,
  ] =
    useState<OpdOverview | null>(
      null
    );

  const [
    labOverview,
    setLabOverview,
  ] =
    useState<LabOverview | null>(
      null
    );

  const [
    operationsOverview,
    setOperationsOverview,
  ] =
    useState<OperationsOverview | null>(
      null
    );

  const [
    activities,
    setActivities,
  ] =
    useState<ClinicalActivity[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        ipdResponse,
        opdResponse,
        labResponse,
        activityResponse,
        operationsResponse,
      ] = await Promise.all([
        fetch(
          "/api/dashboard/ipd-overview",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/dashboard/opd-overview",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/dashboard/lab-overview",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/dashboard/recent-clinical-activity",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/dashboard/operations-overview",
          {
            cache: "no-store",
          }
        ),
      ]);

      const [
        ipdData,
        opdData,
        labData,
        activityData,
        operationsData,
      ] = await Promise.all([
        ipdResponse.json(),
        opdResponse.json(),
        labResponse.json(),
        activityResponse.json(),
        operationsResponse.json(),
      ]);

      if (!ipdResponse.ok) {
        throw new Error(
          ipdData?.message ||
            "Unable to load IPD dashboard."
        );
      }

      if (!opdResponse.ok) {
        throw new Error(
          opdData?.message ||
            "Unable to load OPD dashboard."
        );
      }

      if (!labResponse.ok) {
        throw new Error(
          labData?.message ||
            "Unable to load laboratory dashboard."
        );
      }

      if (!activityResponse.ok) {
        throw new Error(
          activityData?.message ||
            "Unable to load recent clinical activity."
        );
      }

      if (!operationsResponse.ok) {
        throw new Error(
          operationsData?.message ||
            "Unable to load hospital operations."
        );
      }

      setIpdOverview(
        ipdData?.overview || {
          activeIPD: 0,
          availableBeds: 0,
          todayAdmissions: 0,
          todayDischarges: 0,
          recentAdmissions: [],
        }
      );

      setOpdOverview(
        opdData?.overview || {
          totalToday: 0,
          newPatients: 0,
          followUpPatients: 0,
          recentVisits: [],
        }
      );

      setLabOverview(
        labData?.overview || {
          pendingOrders: 0,
          collectedToday: 0,
          reportedToday: 0,
          recentOrders: [],
        }
      );

      setActivities(
        Array.isArray(
          activityData?.activities
        )
          ? activityData.activities
          : []
      );

      setOperationsOverview(
        operationsData?.operations ||
          null
      );
    } catch (error) {
      console.error(
        "DASHBOARD LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const quickActions = [
    {
      title: "New Patient",
      subtitle: "Register patient",
      href: "/patients/new",
      icon: "👤",
      className:
        "bg-blue-600 hover:bg-blue-700",
    },

    {
      title: "OPD",
      subtitle: "Start consultation",
      href: "/opd/select",
      icon: "🩺",
      className:
        "bg-emerald-600 hover:bg-emerald-700",
    },

    {
      title: "IPD Admission",
      subtitle: "Admit patient",
      href: "/ipd",
      icon: "🏥",
      className:
        "bg-violet-600 hover:bg-violet-700",
    },

    {
      title: "Laboratory",
      subtitle: "Lab orders",
      href: "/laboratory",
      icon: "🧪",
      className:
        "bg-orange-500 hover:bg-orange-600",
    },

    {
      title: "Patients",
      subtitle: "Patient records",
      href: "/patients",
      icon: "📋",
      className:
        "bg-slate-700 hover:bg-slate-800",
    },
  ];

  const maxFlowValue =
    useMemo(() => {
      if (
        !operationsOverview?.weeklyFlow
          ?.length
      ) {
        return 1;
      }

      return Math.max(
        1,
        ...operationsOverview.weeklyFlow.flatMap(
          (item) => [
            item.opd,
            item.admissions,
            item.discharges,
          ]
        )
      );
    }, [
      operationsOverview,
    ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1700px] p-4 md:p-6 lg:p-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Atulyam Hospital
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              Hospital Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Complete overview of hospital
              operations and clinical activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh Dashboard"}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="font-semibold text-red-700">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* QUICK ACTIONS */}

        <section className="mb-8">

          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {quickActions.map(
              (action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`${action.className} group flex min-h-[92px] items-center gap-3 rounded-xl p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 text-2xl">
                    {action.icon}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold">
                      {action.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/80">
                      {action.subtitle}
                    </p>

                  </div>

                </Link>
              )
            )}

          </div>

        </section>

        {/* LOADING */}

        {loading &&
          !ipdOverview && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="text-lg font-semibold text-slate-700">
                Loading hospital dashboard...
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we load
                the latest information.
              </p>

            </div>
          )}

        {!loading &&
          ipdOverview && (
            <>

              {/* TODAY OVERVIEW */}

              <section className="mb-8">

                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  Today&apos;s Hospital Overview
                </h2>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

                  <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        🩺
                      </span>

                      <span className="text-xs font-semibold text-blue-600">
                        OPD
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {opdOverview?.totalToday ??
                        0}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      OPD Consultations
                    </p>

                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        🏥
                      </span>

                      <span className="text-xs font-semibold text-violet-600">
                        IPD
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {ipdOverview.activeIPD}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Active Patients
                    </p>

                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        🛏️
                      </span>

                      <span className="text-xs font-semibold text-emerald-600">
                        BEDS
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {ipdOverview.availableBeds}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Available Beds
                    </p>

                  </div>

                  <div className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        ➕
                      </span>

                      <span className="text-xs font-semibold text-cyan-600">
                        IPD
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {ipdOverview.todayAdmissions}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Admissions Today
                    </p>

                  </div>

                  <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        🧪
                      </span>

                      <span className="text-xs font-semibold text-orange-600">
                        LAB
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {labOverview?.pendingOrders ??
                        0}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Pending Lab Orders
                    </p>

                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        ✓
                      </span>

                      <span className="text-xs font-semibold text-rose-600">
                        IPD
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {ipdOverview.todayDischarges}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Discharges Today
                    </p>

                  </div>

                </div>

              </section>

              {/* PHASE 3 OPERATIONS */}

              {operationsOverview && (
                <>

                  {/* OPERATIONS SUMMARY */}

                  <section className="mb-8">

                    <div className="mb-3">

                      <h2 className="text-lg font-bold text-slate-900">
                        Hospital Operations
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Today&apos;s staff,
                        collection and operational
                        overview.
                      </p>

                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                      <Link
                        href="/attendance"
                        className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >

                        <div className="flex items-center justify-between">

                          <span className="text-3xl">
                            👨‍⚕️
                          </span>

                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            STAFF
                          </span>

                        </div>

                        <p className="mt-5 text-3xl font-bold text-slate-900">
                          {
                            operationsOverview.staff
                              .presentStaff
                          }
                          <span className="ml-1 text-base font-medium text-slate-400">
                            /
                            {
                              operationsOverview.staff
                                .totalActiveStaff
                            }
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Staff Present Today
                        </p>

                        <div className="mt-4 flex gap-3 text-xs">

                          <span className="text-red-600">
                            Absent:{" "}
                            {
                              operationsOverview.staff
                                .absentStaff
                            }
                          </span>

                          <span className="text-amber-600">
                            Unmarked:{" "}
                            {
                              operationsOverview.staff
                                .notMarkedStaff
                            }
                          </span>

                        </div>

                      </Link>

                      <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                          <span className="text-3xl">
                            💰
                          </span>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            COLLECTION
                          </span>

                        </div>

                        <p className="mt-5 text-2xl font-bold text-slate-900">
                          {formatCurrency(
                            operationsOverview.revenue
                              .totalCollection
                          )}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Today&apos;s Collection
                        </p>

                        <div className="mt-4 flex gap-3 text-xs text-slate-500">

                          <span>
                            OPD{" "}
                            {formatCurrency(
                              operationsOverview.revenue
                                .opdCollection
                            )}
                          </span>

                          <span>
                            IPD{" "}
                            {formatCurrency(
                              operationsOverview.revenue
                                .ipdCollection
                            )}
                          </span>

                        </div>

                      </div>

                      <Link
                        href="/ipd"
                        className="rounded-xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >

                        <div className="flex items-center justify-between">

                          <span className="text-3xl">
                            📌
                          </span>

                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            PENDING
                          </span>

                        </div>

                        <p className="mt-5 text-3xl font-bold text-slate-900">
                          {
                            operationsOverview.outstanding
                              .admissions
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          IPD Outstanding Accounts
                        </p>

                        <p className="mt-4 text-xs font-semibold text-rose-600">
                          {formatCurrency(
                            operationsOverview.outstanding
                              .amount
                          )}{" "}
                          pending
                        </p>

                      </Link>

                      <Link
                        href="/laboratory"
                        className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >

                        <div className="flex items-center justify-between">

                          <span className="text-3xl">
                            ⚠️
                          </span>

                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            ACTION
                          </span>

                        </div>

                        <p className="mt-5 text-3xl font-bold text-slate-900">
                          {
                            operationsOverview.alerts
                              .filter(
                                (alert) =>
                                  alert.level !==
                                  "success"
                              )
                              .length
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Operational Alerts
                        </p>

                        <p className="mt-4 text-xs font-semibold text-orange-600">
                          Requires attention
                        </p>

                      </Link>

                    </div>

                  </section>

                  {/* PATIENT FLOW + COLLECTION */}

                  <section className="mb-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">

                    {/* WEEKLY FLOW */}

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 p-5">

                        <h2 className="font-bold text-slate-900">
                          7-Day Patient Flow
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          OPD consultations, IPD
                          admissions and discharges.
                        </p>

                      </div>

                      <div className="overflow-x-auto p-5">

                        <div className="min-w-[650px]">

                          <div className="mb-4 flex justify-end gap-5 text-xs font-medium">

                            <span className="flex items-center gap-1">
                              <span className="h-3 w-3 rounded bg-blue-500" />
                              OPD
                            </span>

                            <span className="flex items-center gap-1">
                              <span className="h-3 w-3 rounded bg-violet-500" />
                              Admission
                            </span>

                            <span className="flex items-center gap-1">
                              <span className="h-3 w-3 rounded bg-emerald-500" />
                              Discharge
                            </span>

                          </div>

                          <div className="grid grid-cols-7 gap-4">

                            {operationsOverview.weeklyFlow.map(
                              (item) => (

                                <div
                                  key={
                                    item.date
                                  }
                                  className="flex flex-col"
                                >

                                  <div className="flex h-44 items-end justify-center gap-1 rounded-lg bg-slate-50 px-2 pt-3">

                                    <div className="flex h-full flex-1 items-end">

                                      <div
                                        title={`OPD: ${item.opd}`}
                                        style={{
                                          height: `${
                                            (item.opd /
                                              maxFlowValue) *
                                            100
                                          }%`,
                                        }}
                                        className="w-full min-h-[4px] rounded-t bg-blue-500 transition-all"
                                      />

                                    </div>

                                    <div className="flex h-full flex-1 items-end">

                                      <div
                                        title={`Admissions: ${item.admissions}`}
                                        style={{
                                          height: `${
                                            (item.admissions /
                                              maxFlowValue) *
                                            100
                                          }%`,
                                        }}
                                        className="w-full min-h-[4px] rounded-t bg-violet-500 transition-all"
                                      />

                                    </div>

                                    <div className="flex h-full flex-1 items-end">

                                      <div
                                        title={`Discharges: ${item.discharges}`}
                                        style={{
                                          height: `${
                                            (item.discharges /
                                              maxFlowValue) *
                                            100
                                          }%`,
                                        }}
                                        className="w-full min-h-[4px] rounded-t bg-emerald-500 transition-all"
                                      />

                                    </div>

                                  </div>

                                  <p className="mt-2 text-center text-xs font-semibold text-slate-600">
                                    {item.label}
                                  </p>

                                  <p className="mt-1 text-center text-[10px] text-slate-400">
                                    {item.opd} /{" "}
                                    {
                                      item.admissions
                                    }{" "}
                                    /{" "}
                                    {
                                      item.discharges
                                    }
                                  </p>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* COLLECTION BREAKDOWN */}

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 p-5">

                        <h2 className="font-bold text-slate-900">
                          Today&apos;s Collection
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Collection by hospital
                          department.
                        </p>

                      </div>

                      <div className="space-y-5 p-5">

                        <div>

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-700">
                              OPD
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              {formatCurrency(
                                operationsOverview.revenue
                                  .opdCollection
                              )}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              style={{
                                width: `${
                                  operationsOverview.revenue
                                    .totalCollection >
                                  0
                                    ? (operationsOverview
                                        .revenue
                                        .opdCollection /
                                        operationsOverview
                                          .revenue
                                          .totalCollection) *
                                      100
                                    : 0
                                }%`,
                              }}
                              className="h-full rounded-full bg-blue-500"
                            />

                          </div>

                        </div>

                        <div>

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-700">
                              IPD
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              {formatCurrency(
                                operationsOverview.revenue
                                  .ipdCollection
                              )}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              style={{
                                width: `${
                                  operationsOverview.revenue
                                    .totalCollection >
                                  0
                                    ? (operationsOverview
                                        .revenue
                                        .ipdCollection /
                                        operationsOverview
                                          .revenue
                                          .totalCollection) *
                                      100
                                    : 0
                                }%`,
                              }}
                              className="h-full rounded-full bg-violet-500"
                            />

                          </div>

                        </div>

                        <div>

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-700">
                              Laboratory
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              {formatCurrency(
                                operationsOverview.revenue
                                  .laboratoryCollection
                              )}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              style={{
                                width: `${
                                  operationsOverview.revenue
                                    .totalCollection >
                                  0
                                    ? (operationsOverview
                                        .revenue
                                        .laboratoryCollection /
                                        operationsOverview
                                          .revenue
                                          .totalCollection) *
                                      100
                                    : 0
                                }%`,
                              }}
                              className="h-full rounded-full bg-orange-500"
                            />

                          </div>

                        </div>

                        <div className="border-t border-slate-100 pt-5">

                          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            Total Collection
                          </p>

                          <p className="mt-2 text-3xl font-bold text-emerald-600">
                            {formatCurrency(
                              operationsOverview.revenue
                                .totalCollection
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* ALERTS */}

                  <section className="mb-8">

                    <div className="mb-3">

                      <h2 className="text-lg font-bold text-slate-900">
                        Hospital Alerts & Pending Tasks
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Items requiring operational
                        attention.
                      </p>

                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                      {operationsOverview.alerts.map(
                        (alert) => (

                          <Link
                            key={alert.id}
                            href={alert.href}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div>

                                <p className="text-2xl font-bold text-slate-900">
                                  {alert.count}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                  {alert.title}
                                </p>

                              </div>

                              <span
                                className={`h-3 w-3 rounded-full ${
                                  alert.level ===
                                  "danger"
                                    ? "bg-red-500"
                                    : alert.level ===
                                      "warning"
                                    ? "bg-orange-500"
                                    : alert.level ===
                                      "info"
                                    ? "bg-blue-500"
                                    : "bg-emerald-500"
                                }`}
                              />

                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-slate-500">
                              {
                                alert.description
                              }
                            </p>

                          </Link>

                        )
                      )}

                    </div>

                  </section>

                </>
              )}

              {/* OPD + IPD */}

              <section className="mb-8 grid gap-6 xl:grid-cols-2">

                {/* OPD */}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex items-center justify-between border-b border-slate-100 p-5">

                    <div>

                      <h2 className="font-bold text-slate-900">
                        OPD Overview
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Today&apos;s outpatient
                        activity
                      </p>

                    </div>

                    <Link
                      href="/opd/today"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View OPD →
                    </Link>

                  </div>

                  <div className="grid grid-cols-2 border-b border-slate-100">

                    <div className="border-r border-slate-100 p-5">

                      <p className="text-2xl font-bold text-slate-900">
                        {opdOverview?.newPatients ??
                          0}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        New Patients
                      </p>

                    </div>

                    <div className="p-5">

                      <p className="text-2xl font-bold text-slate-900">
                        {opdOverview?.followUpPatients ??
                          0}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Follow-ups
                      </p>

                    </div>

                  </div>

                  <div className="p-5">

                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                      Recent Visits
                    </h3>

                    {opdOverview?.recentVisits
                      ?.length ? (

                      <div className="space-y-3">

                        {opdOverview.recentVisits
                          .slice(0, 5)
                          .map((visit) => (

                            <div
                              key={visit.id}
                              className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                            >

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {getPatientName(
                                    visit.patient
                                  )}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {
                                    visit.patient
                                      ?.patientId
                                  }
                                </p>

                              </div>

                              <span className="ml-4 shrink-0 text-xs text-slate-500">
                                {formatDateTime(
                                  visit.createdAt ||
                                    visit.visitDate
                                )}
                              </span>

                            </div>

                          ))}

                      </div>

                    ) : (

                      <p className="py-8 text-center text-sm text-slate-400">
                        No OPD visits today.
                      </p>

                    )}

                  </div>

                </div>

                {/* IPD */}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex items-center justify-between border-b border-slate-100 p-5">

                    <div>

                      <h2 className="font-bold text-slate-900">
                        IPD Overview
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Recent admissions and
                        patient activity
                      </p>

                    </div>

                    <Link
                      href="/ipd"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Manage IPD →
                    </Link>

                  </div>

                  <div className="p-5">

                    {ipdOverview.recentAdmissions
                      ?.length ? (

                      <div className="space-y-3">

                        {ipdOverview.recentAdmissions
                          .slice(0, 5)
                          .map(
                            (admission) => (

                              <Link
                                key={
                                  admission.id
                                }
                                href={`/ipd/admissions/${admission.id}`}
                                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"
                              >

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {getPatientName(
                                      admission.patient
                                    )}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {
                                      admission.ipdNo
                                    }{" "}
                                    •{" "}
                                    {
                                      admission.bed
                                        ?.ward
                                        ?.code ||
                                      "-"
                                    }
                                    -
                                    {
                                      admission.bed
                                        ?.bedNumber ||
                                      "-"
                                    }
                                  </p>

                                  {admission.provisionalDiagnosis && (

                                    <p className="mt-1 truncate text-xs text-slate-400">
                                      {
                                        admission.provisionalDiagnosis
                                      }
                                    </p>

                                  )}

                                </div>

                                <div className="ml-4 text-right">

                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      admission.status ===
                                      "Discharged"
                                        ? "bg-slate-100 text-slate-600"
                                        : "bg-emerald-50 text-emerald-700"
                                    }`}
                                  >
                                    {
                                      admission.status
                                    }
                                  </span>

                                  <p className="mt-2 text-xs text-slate-400">
                                    {formatDate(
                                      admission.admissionDate
                                    )}
                                  </p>

                                </div>

                              </Link>

                            )
                          )}

                      </div>

                    ) : (

                      <p className="py-12 text-center text-sm text-slate-400">
                        No IPD admissions found.
                      </p>

                    )}

                  </div>

                </div>

              </section>

              {/* LAB + CLINICAL ACTIVITY */}

              <section className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">

                {/* LAB */}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex items-center justify-between border-b border-slate-100 p-5">

                    <div>

                      <h2 className="font-bold text-slate-900">
                        Laboratory
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Laboratory activity
                        overview
                      </p>

                    </div>

                    <Link
                      href="/laboratory"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Open Lab →
                    </Link>

                  </div>

                  <div className="grid grid-cols-3 border-b border-slate-100">

                    <div className="border-r border-slate-100 p-4 text-center">

                      <p className="text-xl font-bold text-slate-900">
                        {labOverview?.pendingOrders ??
                          0}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pending
                      </p>

                    </div>

                    <div className="border-r border-slate-100 p-4 text-center">

                      <p className="text-xl font-bold text-slate-900">
                        {labOverview?.collectedToday ??
                          0}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Collected
                      </p>

                    </div>

                    <div className="p-4 text-center">

                      <p className="text-xl font-bold text-slate-900">
                        {labOverview?.reportedToday ??
                          0}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Reported
                      </p>

                    </div>

                  </div>

                  <div className="p-5">

                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                      Recent Orders
                    </h3>

                    {labOverview?.recentOrders
                      ?.length ? (

                      <div className="space-y-3">

                        {labOverview.recentOrders
                          .slice(0, 5)
                          .map((order) => (

                            <div
                              key={order.id}
                              className="rounded-lg border border-slate-100 p-3"
                            >

                              <div className="flex items-center justify-between gap-3">

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {getPatientName(
                                      order.patient
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {
                                      order.patient
                                        ?.patientId ||
                                      "-"
                                    }
                                  </p>

                                </div>

                                <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                  {
                                    order.status ||
                                    "Pending"
                                  }
                                </span>

                              </div>

                            </div>

                          ))}

                      </div>

                    ) : (

                      <p className="py-8 text-center text-sm text-slate-400">
                        No recent laboratory
                        orders.
                      </p>

                    )}

                  </div>

                </div>

                {/* RECENT ACTIVITY */}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-5">

                    <h2 className="font-bold text-slate-900">
                      Recent Clinical Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Latest OPD consultations
                      and IPD activity
                    </p>

                  </div>

                  <div className="divide-y divide-slate-100">

                    {activities.length ? (

                      activities
                        .slice(0, 10)
                        .map(
                          (activity) => (

                            <Link
                              key={activity.id}
                              href={activity.href}
                              className="flex items-center gap-4 p-4 transition hover:bg-slate-50"
                            >

                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                                  activity.type ===
                                  "IPD"
                                    ? "bg-violet-50"
                                    : activity.type ===
                                      "OPD"
                                    ? "bg-blue-50"
                                    : "bg-slate-100"
                                }`}
                              >
                                {activity.type ===
                                "IPD"
                                  ? "🏥"
                                  : activity.type ===
                                    "OPD"
                                  ? "🩺"
                                  : "📋"}
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {
                                      activity.patientName
                                    }
                                  </p>

                                  <span className="text-xs text-slate-400">
                                    {formatDateTime(
                                      activity.date
                                    )}
                                  </span>

                                </div>

                                <p className="mt-1 text-xs font-medium text-slate-600">
                                  {
                                    activity.title
                                  }{" "}
                                  •{" "}
                                  {
                                    activity.reference
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {
                                    activity.description ||
                                    activity.patientId
                                  }
                                </p>

                              </div>

                            </Link>

                          )
                        )

                    ) : (

                      <p className="py-16 text-center text-sm text-slate-400">
                        No recent clinical
                        activity found.
                      </p>

                    )}

                  </div>

                </div>

              </section>

            </>
          )}

      </div>
    </main>
  );
}