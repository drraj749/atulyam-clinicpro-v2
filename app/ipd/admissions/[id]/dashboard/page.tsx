"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type DashboardData = {
  admission: {
    id: number;
    ipdNo: string;
    admissionDate: string;
    dischargeDate: string | null;
    status: string;
    admittingDoctor: string | null;
    department: string | null;
    chiefComplaint: string | null;
    provisionalDiagnosis: string | null;
    patient: {
      id: number;
      patientId: string;
      firstName: string;
      lastName: string | null;
      age: number;
      gender: string;
      mobile: string | null;
      bloodGroup: string | null;
    };
    bed: {
      id: number;
      bedNumber: string;
      status: string;
      ward: {
        name: string;
        code: string;
      };
    } | null;
  };

  latestVitals: {
    id: number;
    temperature: number | null;
    pulse: number | null;
    respiratoryRate: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    spo2: number | null;
    weight: number | null;
    painScore: number | null;
    remarks: string | null;
    recordedBy: string | null;
    recordedAt: string;
  } | null;

  latestClinicalNote: {
    id: number;
    noteType: string;
    note: string;
    createdBy: string | null;
    createdAt: string;
  } | null;

  recentVitals: Array<{
    id: number;
    temperature: number | null;
    pulse: number | null;
    respiratoryRate: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    spo2: number | null;
    recordedAt: string;
  }>;

  clinicalNotes: Array<{
    id: number;
    noteType: string;
    note: string;
    createdBy: string | null;
    createdAt: string;
  }>;

  medications: {
    total: number;
    active: number;
    orders: Array<{
      id: number;
      medicineName: string;
      strength: string | null;
      dosage: string | null;
      frequency: string | null;
      route: string | null;
      duration: string | null;
      instruction: string | null;
      status: string;
    }>;
  };

  investigations: {
    total: number;
    pending: number;
    completed: number;
    items: Array<{
      id: number;
      testName: string;
      testCode: string | null;
      category: string | null;
      status: string;
      result: string | null;
      orderedAt: string;
    }>;
  };

  billing: {
    totalCharges: number;
    totalPayments: number;
    balance: number;
    charges: Array<{
      id: number;
      category: string;
      description: string;
      total: number;
      chargeDate: string;
    }>;
    payments: Array<{
      id: number;
      receiptNo: string;
      amount: number;
      paymentMode: string;
      paidAt: string;
    }>;
  };

  dischargeSummary: {
    id: number;
    finalDiagnosis: string | null;
    conditionAtDischarge: string | null;
    dischargeDate: string;
  } | null;

  dashboard: {
    isDischarged: boolean;
    hasDischargeSummary: boolean;
    latestVitalRecorded: boolean;
    activeMedications: number;
    pendingInvestigations: number;
    outstandingBalance: number;
  };
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function IpdPatientDashboardPage() {
  const params = useParams();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(
    async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/ipd/admissions/${id}/dashboard`,
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to load patient dashboard."
          );
        }

        setData(result);
      } catch (error) {
        console.error(
          "LOAD IPD PATIENT DASHBOARD ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load patient dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <div className="text-lg font-semibold text-gray-700">
              Loading IPD Patient Dashboard...
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Please wait while patient information is loading.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              Unable to Load Patient Dashboard
            </h1>

            <p className="mt-3 text-gray-600">
              {error ||
                "Patient dashboard data is unavailable."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-lg bg-blue-900 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
              >
                Try Again
              </button>

              <Link
                href="/ipd"
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to IPD
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    admission,
    latestVitals,
    latestClinicalNote,
    recentVitals,
    clinicalNotes,
    medications,
    investigations,
    billing,
    dischargeSummary,
    dashboard,
  } = data;

  const patientName =
    `${admission.patient.firstName} ${
      admission.patient.lastName || ""
    }`.trim();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* TOP NAVIGATION */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/ipd"
              className="inline-flex items-center text-sm font-semibold text-blue-900 hover:underline"
            >
              ← Back to IPD Management
            </Link>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
              IPD Patient Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Complete clinical and billing overview
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-lg border border-blue-900 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
          >
            ↻ Refresh Dashboard
          </button>
        </div>

        {/* PATIENT HEADER */}

        <div className="overflow-hidden rounded-2xl bg-blue-900 text-white shadow-lg">

          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {patientName}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    admission.status === "Discharged"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-400 text-yellow-950"
                  }`}
                >
                  {admission.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-blue-100 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <span className="font-semibold text-white">
                    Patient ID:
                  </span>{" "}
                  {admission.patient.patientId}
                </div>

                <div>
                  <span className="font-semibold text-white">
                    IPD No:
                  </span>{" "}
                  {admission.ipdNo}
                </div>

                <div>
                  <span className="font-semibold text-white">
                    Age / Gender:
                  </span>{" "}
                  {admission.patient.age} Years /{" "}
                  {admission.patient.gender}
                </div>

                <div>
                  <span className="font-semibold text-white">
                    Mobile:
                  </span>{" "}
                  {admission.patient.mobile || "—"}
                </div>

                <div>
                  <span className="font-semibold text-white">
                    Blood Group:
                  </span>{" "}
                  {admission.patient.bloodGroup || "—"}
                </div>

                <div>
                  <span className="font-semibold text-white">
                    Department:
                  </span>{" "}
                  {admission.department || "—"}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider text-blue-200">
                Bed Information
              </div>

              <div className="mt-2 text-xl font-bold">
                {admission.bed
                  ? `${admission.bed.ward.name} • ${admission.bed.bedNumber}`
                  : "No Bed Assigned"}
              </div>

              <div className="mt-2 text-sm text-blue-100">
                Admitted:{" "}
                {formatDate(
                  admission.admissionDate
                )}
              </div>

              {admission.dischargeDate && (
                <div className="mt-1 text-sm text-blue-100">
                  Discharged:{" "}
                  {formatDate(
                    admission.dischargeDate
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* CLINICAL SUMMARY */}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-500">
              Active Medications
            </div>

            <div className="mt-2 text-3xl font-bold text-blue-900">
              {dashboard.activeMedications}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {medications.total} total orders
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-500">
              Pending Investigations
            </div>

            <div className="mt-2 text-3xl font-bold text-orange-600">
              {dashboard.pendingInvestigations}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {investigations.completed} completed
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-gray-500">
              Total Hospital Charges
            </div>

            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(
                billing.totalCharges
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Payments:{" "}
              {formatCurrency(
                billing.totalPayments
              )}
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 shadow-sm ${
              dashboard.outstandingBalance > 0
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <div className="text-sm font-medium text-gray-600">
              Outstanding Balance
            </div>

            <div
              className={`mt-2 text-2xl font-bold ${
                dashboard.outstandingBalance > 0
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {formatCurrency(
                dashboard.outstandingBalance
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {dashboard.outstandingBalance > 0
                ? "Payment pending"
                : "No outstanding balance"}
            </p>
          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href={`/ipd`}
              className="rounded-lg border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-900 hover:bg-blue-100"
            >
              🏥 Manage IPD
            </Link>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `/ipd?admissionId=${admission.id}`,
                  "_self"
                )
              }
              className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-left font-semibold text-purple-800 hover:bg-purple-100"
            >
              💊 Clinical Management
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `/ipd?admissionId=${admission.id}&tab=billing`,
                  "_self"
                )
              }
              className="rounded-lg border border-green-200 bg-green-50 p-4 text-left font-semibold text-green-800 hover:bg-green-100"
            >
              ₹ Billing & Payments
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `/ipd?admissionId=${admission.id}&tab=discharge`,
                  "_self"
                )
              }
              className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-left font-semibold text-orange-800 hover:bg-orange-100"
            >
              📄 Discharge Summary
            </button>

          </div>

        </div>

        {/* MAIN CONTENT */}

        <div className="mt-6 grid gap-6 xl:grid-cols-3">

          {/* LEFT SIDE */}

          <div className="space-y-6 xl:col-span-2">

            {/* DIAGNOSIS */}

            <div className="rounded-xl border bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-gray-900">
                Clinical Information
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Chief Complaint
                  </div>

                  <p className="mt-2 text-gray-800">
                    {admission.chiefComplaint ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Provisional Diagnosis
                  </div>

                  <p className="mt-2 text-gray-800">
                    {admission.provisionalDiagnosis ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Admitting Doctor
                  </div>

                  <p className="mt-2 text-gray-800">
                    {admission.admittingDoctor ||
                      "Not recorded"}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Admission Date
                  </div>

                  <p className="mt-2 text-gray-800">
                    {formatDate(
                      admission.admissionDate
                    )}
                  </p>
                </div>

              </div>

            </div>

            {/* MEDICATIONS */}

            <div className="rounded-xl border bg-white shadow-sm">

              <div className="border-b p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Medication Orders
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Active and prescribed medicines
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
                    {medications.total}
                  </span>
                </div>
              </div>

              {medications.orders.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No medication orders available.
                </div>
              ) : (
                <div className="divide-y">
                  {medications.orders.map(
                    (medicine) => (
                      <div
                        key={medicine.id}
                        className="p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div>
                            <div className="font-semibold text-gray-900">
                              {medicine.medicineName}
                              {medicine.strength
                                ? ` ${medicine.strength}`
                                : ""}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                              {medicine.dosage && (
                                <span>
                                  {medicine.dosage}
                                </span>
                              )}

                              {medicine.frequency && (
                                <span>
                                  • {medicine.frequency}
                                </span>
                              )}

                              {medicine.route && (
                                <span>
                                  • {medicine.route}
                                </span>
                              )}

                              {medicine.duration && (
                                <span>
                                  • {medicine.duration}
                                </span>
                              )}
                            </div>

                            {medicine.instruction && (
                              <p className="mt-2 text-sm text-gray-500">
                                {medicine.instruction}
                              </p>
                            )}
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              medicine.status ===
                              "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {medicine.status}
                          </span>

                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>

            {/* INVESTIGATIONS */}

            <div className="rounded-xl border bg-white shadow-sm">

              <div className="border-b p-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Investigations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ordered laboratory and diagnostic tests
                </p>
              </div>

              {investigations.items.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No investigations ordered.
                </div>
              ) : (
                <div className="divide-y">
                  {investigations.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.testName}
                          </div>

                          <div className="mt-1 text-sm text-gray-500">
                            {item.category || "General"}

                            {item.testCode
                              ? ` • ${item.testCode}`
                              : ""}
                          </div>

                          {item.result && (
                            <p className="mt-2 text-sm text-gray-700">
                              Result: {item.result}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.status ===
                            "Completed"
                              ? "bg-green-100 text-green-700"
                              : item.status ===
                                  "Pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* LATEST VITALS */}

            <div className="rounded-xl border bg-white shadow-sm">

              <div className="border-b p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Latest Vitals
                    </h2>

                    {latestVitals && (
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(
                          latestVitals.recordedAt
                        )}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      latestVitals
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {latestVitals
                      ? "Recorded"
                      : "No Data"}
                  </span>
                </div>
              </div>

              {!latestVitals ? (
                <div className="p-5 text-sm text-gray-500">
                  No vitals recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-5">

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">
                      Temperature
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {latestVitals.temperature ??
                        "—"}{" "}
                      °C
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">
                      Pulse
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {latestVitals.pulse ?? "—"}{" "}
                      /min
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">
                      Blood Pressure
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {latestVitals.systolicBp ??
                        "—"}
                      /
                      {latestVitals.diastolicBp ??
                        "—"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">
                      SpO₂
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {latestVitals.spo2 ?? "—"}%
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">
                      Respiratory Rate
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {latestVitals.respiratoryRate ??
                        "—"}{" "}
                      /min
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">
                      Pain Score
                    </div>

                    <div className="mt-1 font-bold text-gray-900">
                      {latestVitals.painScore ?? "—"}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* LATEST CLINICAL NOTE */}

            <div className="rounded-xl border bg-white shadow-sm">

              <div className="border-b p-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Latest Clinical Note
                </h2>
              </div>

              {!latestClinicalNote ? (
                <div className="p-5 text-sm text-gray-500">
                  No clinical notes recorded.
                </div>
              ) : (
                <div className="p-5">

                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {latestClinicalNote.noteType}
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDate(
                        latestClinicalNote.createdAt
                      )}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {latestClinicalNote.note}
                  </p>

                  {latestClinicalNote.createdBy && (
                    <p className="mt-4 text-xs font-medium text-gray-500">
                      By{" "}
                      {
                        latestClinicalNote.createdBy
                      }
                    </p>
                  )}

                </div>
              )}

            </div>

            {/* DISCHARGE STATUS */}

            <div
              className={`rounded-xl border p-5 shadow-sm ${
                dashboard.isDischarged
                  ? "border-green-200 bg-green-50"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <h2 className="text-lg font-bold text-gray-900">
                Discharge Status
              </h2>

              <div className="mt-4">

                <div
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                    dashboard.isDischarged
                      ? "bg-green-600 text-white"
                      : "bg-blue-900 text-white"
                  }`}
                >
                  {dashboard.isDischarged
                    ? "Discharged"
                    : "Currently Admitted"}
                </div>

                {dischargeSummary && (
                  <div className="mt-4 space-y-2 text-sm text-gray-700">

                    <div>
                      <span className="font-semibold">
                        Final Diagnosis:
                      </span>{" "}
                      {dischargeSummary.finalDiagnosis ||
                        "—"}
                    </div>

                    <div>
                      <span className="font-semibold">
                        Condition:
                      </span>{" "}
                      {dischargeSummary.conditionAtDischarge ||
                        "—"}
                    </div>

                    <div>
                      <span className="font-semibold">
                        Summary Date:
                      </span>{" "}
                      {formatDate(
                        dischargeSummary.dischargeDate
                      )}
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

        {/* RECENT ACTIVITY */}

        <div className="mt-6 rounded-xl border bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Clinical Activity
            </h2>
          </div>

          <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">

            <div className="p-5">
              <h3 className="font-semibold text-gray-800">
                Recent Vitals
              </h3>

              {recentVitals.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No recent vital records.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentVitals.map((vital) => (
                    <div
                      key={vital.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="font-semibold text-gray-700">
                        {formatDate(
                          vital.recordedAt
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-gray-600">
                        <span>
                          BP:{" "}
                          {vital.systolicBp ?? "—"}/
                          {vital.diastolicBp ?? "—"}
                        </span>

                        <span>
                          Pulse:{" "}
                          {vital.pulse ?? "—"}
                        </span>

                        <span>
                          SpO₂:{" "}
                          {vital.spo2 ?? "—"}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div className="p-5">
              <h3 className="font-semibold text-gray-800">
                Recent Clinical Notes
              </h3>

              {clinicalNotes.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No recent clinical notes.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {clinicalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs font-bold text-blue-700">
                          {note.noteType}
                        </span>

                        <span className="text-xs text-gray-400">
                          {formatDate(
                            note.createdAt
                          )}
                        </span>

                      </div>

                      <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                        {note.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}