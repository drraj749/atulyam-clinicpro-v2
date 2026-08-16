"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PrescriptionItem = {
  id: number;
  medicineName: string;
  strength?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instruction?: string | null;

  morning: boolean;
  afternoon: boolean;
  night: boolean;

  beforeFood: boolean;
  afterFood: boolean;

  sos: boolean;

  quantity?: number | null;
  route?: string | null;
};

type Visit = {
  id: number;
isFollowUp?: boolean;
  opdNo: string;

  doctor: string;

  department: string;

  complaint?: string | null;

  examination?: string | null;

  diagnosis?: string | null;

  advice?: string | null;

  bp?: string | null;

  pulse?: number | null;

  temperature?: number | null;

  spo2?: number | null;

  height?: number | null;

  weight?: number | null;

  followUpDate?: string | null;

  createdAt: string;

  prescription?: {
    id: number;
    notes?: string | null;
    investigations?: string | null;
    items: PrescriptionItem[];
  } | null;
};

type Props = {
  patientId: string;
  visits: Visit[] | unknown;
};

export default function PatientVisitHistory({
  patientId,
  visits,
}: Props) {
  const router = useRouter();
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);

  const visitList = Array.isArray(visits) ? visits : [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          OPD Visit History
        </h2>

        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {visitList.length} Visit{visitList.length !== 1 ? "s" : ""}
        </span>
      </div>

      {visitList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No previous OPD visits found.
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:left-6 before:top-3 before:h-full before:w-1 before:bg-blue-200">
  {visitList.map((visit) => (
    <div
  key={visit.id}
  className="relative ml-14 border border-gray-200 rounded-xl overflow-hidden shadow bg-white"
>
  <div className="absolute -left-11 top-5 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
  {visitList.length - visitList.indexOf(visit)}
</div>
      <button
        type="button"
        onClick={() =>
          setExpandedVisit(
            expandedVisit === visit.id ? null : visit.id
          )
        }
        className="w-full bg-blue-50 hover:bg-blue-100 px-6 py-4 flex justify-between items-center"
      >
        <div className="text-left">

  <div className="flex items-center gap-2 flex-wrap">

  <span className="font-bold text-2xl text-blue-800">
    OPD No. {visit.opdNo}
  </span>

  {visit.isFollowUp && (
    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
      FOLLOW-UP
    </span>
  )}

  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
    {new Date(visit.createdAt).toLocaleString("en-IN")}
  </span>

</div>

  <div className="mt-2 text-gray-700">

    <span className="font-semibold">
      Diagnosis:
    </span>{" "}

    {visit.diagnosis || "Not Recorded"}

  </div>

  {visit.complaint && (

    <div className="text-sm text-gray-500 mt-1">

      <span className="font-medium">
        Complaint:
      </span>{" "}

      {visit.complaint.length > 70
        ? visit.complaint.substring(0, 70) + "..."
        : visit.complaint}

    </div>

  )}

</div>

        <div className="text-right">

  <div className="font-semibold text-lg">
    {visit.doctor}
  </div>

  <div className="text-sm text-gray-500">
    {visit.department}
  </div>

  <div className="flex justify-end mt-2 gap-2 flex-wrap">

    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
      Completed
    </span>

    {visit.prescription && (
      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
        Prescription
      </span>
    )}

    {visit.followUpDate && (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
        Follow-up
      </span>
    )}

  </div>

</div>
      </button>

      {expandedVisit === visit.id && (
        <div className="p-6">
          
<h3 className="text-lg font-bold text-gray-800 mb-4">
  Visit Summary
</h3>

<div className="mb-5 flex flex-wrap gap-2">

  {visit.bp &&
    (() => {
      const [sys, dia] = visit.bp.split("/").map(Number);

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            sys >= 140 || dia >= 90
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {sys >= 140 || dia >= 90
            ? "🔴 High BP"
            : "🟢 BP Normal"}
        </span>
      );
    })()}

  {visit.pulse && (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        visit.pulse > 100
          ? "bg-red-100 text-red-700"
          : visit.pulse < 60
          ? "bg-blue-100 text-blue-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {visit.pulse > 100
        ? "🔴 Tachycardia"
        : visit.pulse < 60
        ? "🔵 Bradycardia"
        : "🟢 Pulse Normal"}
    </span>
  )}

  {visit.temperature && (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        visit.temperature >= 100.4
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {visit.temperature >= 100.4
        ? "🌡 Fever"
        : "🌡 Normal"}
    </span>
  )}

  {visit.spo2 && (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        visit.spo2 < 90
          ? "bg-red-100 text-red-700"
          : visit.spo2 < 94
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {visit.spo2 < 90
        ? "🫁 Critical SpO₂"
        : visit.spo2 < 94
        ? "🫁 Low SpO₂"
        : "🫁 Normal SpO₂"}
    </span>
  )}

  {visit.height && visit.weight && (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
      📊 BMI{" "}
      {(
        visit.weight /
        Math.pow(visit.height / 100, 2)
      ).toFixed(1)}
    </span>
  )}

</div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">
  🩺 Vital Signs
</h3>

<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">

  <div
  className={`rounded-xl p-4 border ${
    visit.bp &&
    (() => {
      const parts = visit.bp.split("/");
      const sys = Number(parts[0]);
      const dia = Number(parts[1]);
      return sys >= 140 || dia >= 90;
    })()
      ? "bg-red-100 border-red-500"
      : "bg-red-50 border-red-200"
  }`}
>

  <div className="text-2xl mb-2">❤️</div>

  <div className="text-xs uppercase font-semibold">
    Blood Pressure
  </div>

  <div className="text-xl font-bold mt-2">
    {visit.bp || "-"}
  </div>

  {visit.bp &&
  (() => {
    const parts = visit.bp.split("/");
    const sys = Number(parts[0]);
    const dia = Number(parts[1]);

    let text = "";
    let color = "";

    if (sys < 90 || dia < 60) {
      text = "Low Blood Pressure";
      color = "text-blue-700";
    } else if (sys < 120 && dia < 80) {
      text = "Normal";
      color = "text-green-700";
    } else if (sys < 140 && dia < 90) {
      text = "Elevated";
      color = "text-yellow-700";
    } else {
      text = "High Blood Pressure";
      color = "text-red-700";
    }

    return (
      <div className={`mt-2 text-xs font-bold ${color}`}>
        {text}
      </div>
    );
  })()}

</div>

  <div
  className={`rounded-xl p-4 border ${
    visit.pulse && visit.pulse > 100
      ? "bg-red-100 border-red-500"
      : "bg-pink-50 border-pink-200"
  }`}
>

  <div className="text-2xl mb-2">💓</div>

  <div className="text-xs uppercase font-semibold">
    Pulse
  </div>

  <div className="text-xl font-bold mt-2">
    {visit.pulse ?? "-"} /min
  </div>

  {visit.pulse &&
  (() => {
    let text = "";
    let color = "";

    if (visit.pulse < 60) {
      text = "Bradycardia";
      color = "text-blue-700";
    } else if (visit.pulse <= 100) {
      text = "Normal";
      color = "text-green-700";
    } else {
      text = "Tachycardia";
      color = "text-red-700";
    }

    return (
      <div className={`mt-2 text-xs font-bold ${color}`}>
        {text}
      </div>
    );
  })()}

</div>

  <div
  className={`rounded-xl p-4 border ${
    visit.temperature && visit.temperature >= 100.4
      ? "bg-red-100 border-red-500"
      : "bg-orange-50 border-orange-200"
  }`}
>

  <div className="text-2xl mb-2">🌡️</div>

  <div className="text-xs uppercase font-semibold">
    Temperature
  </div>

  <div className="text-xl font-bold mt-2">
    {visit.temperature ?? "-"} °F
  </div>

  {visit.temperature &&
  (() => {
    let text = "";
    let color = "";

    if (visit.temperature < 97) {
      text = "Low";
      color = "text-blue-700";
    } else if (visit.temperature < 100.4) {
      text = "Normal";
      color = "text-green-700";
    } else {
      text = "Fever";
      color = "text-red-700";
    }

    return (
      <div className={`mt-2 text-xs font-bold ${color}`}>
        {text}
      </div>
    );
  })()}

</div>

  <div
  className={`rounded-xl p-4 border ${
    visit.spo2 && visit.spo2 < 94
      ? "bg-red-100 border-red-500"
      : "bg-blue-50 border-blue-200"
  }`}
>

  <div className="text-2xl mb-2">🫁</div>

  <div className="text-xs uppercase font-semibold">
    SpO₂
  </div>

  <div className="text-xl font-bold mt-2">
    {visit.spo2 ?? "-"}%
  </div>

  {visit.spo2 &&
  (() => {
    let text = "";
    let color = "";

    if (visit.spo2 < 90) {
      text = "Critical";
      color = "text-red-700";
    } else if (visit.spo2 < 94) {
      text = "Low";
      color = "text-yellow-700";
    } else {
      text = "Normal";
      color = "text-green-700";
    }

    return (
      <div className={`mt-2 text-xs font-bold ${color}`}>
        {text}
      </div>
    );
  })()}

</div>

  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
  <div className="text-2xl mb-2">📏</div>

  <div className="text-xs uppercase text-green-600 font-semibold">
    Height
  </div>

  <div className="text-xl font-bold mt-2">
    {visit.height ?? "-"} cm
  </div>
</div>

  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
  <div className="text-2xl mb-2">⚖️</div>

  <div className="text-xs uppercase text-purple-600 font-semibold">
    Weight
  </div>

  <div className="text-xl font-bold mt-2">
    {visit.weight ?? "-"} kg
  </div>
</div>
<div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">

  <div className="text-2xl mb-2">📊</div>

  <div className="text-xs uppercase text-indigo-600 font-semibold">
    BMI
  </div>

  {visit.height && visit.weight ? (
    <>
      <div className="text-xl font-bold mt-2">
        {(
          visit.weight /
          Math.pow(visit.height / 100, 2)
        ).toFixed(1)}
      </div>

      <div className="mt-2 text-xs font-semibold">

        {(visit.weight / Math.pow(visit.height / 100, 2)) < 18.5
          ? "Underweight"

          : (visit.weight / Math.pow(visit.height / 100, 2)) < 25
          ? "Normal"

          : (visit.weight / Math.pow(visit.height / 100, 2)) < 30
          ? "Overweight"

          : "Obese"}

      </div>
    </>
  ) : (
    <div className="text-xl font-bold mt-2">
      -
    </div>
  )}

</div>
</div>

<h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">
  📋 Clinical Assessment
</h3>

<h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">
  📋 Clinical Assessment
</h3>

<div className="mt-6 space-y-5">

  <div className="bg-red-50 border border-red-200 rounded-xl p-4">

  <div className="flex items-center justify-between mb-3">

  <h3 className="font-semibold text-red-700">
    Diagnosis
  </h3>

  {visit.diagnosis && (
    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
      Primary Diagnosis
    </span>
  )}

</div>

  <p className="whitespace-pre-wrap text-gray-800">
    {visit.diagnosis || "-"}
  </p>

</div>

  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">

  <h3 className="font-semibold text-cyan-700 mb-2">
    Examination
  </h3>

  <p className="whitespace-pre-wrap text-gray-800">
    {visit.examination || "-"}
  </p>

</div>

{visit.prescription && (
  <div className="mt-8">
    <div className="flex items-center justify-between mb-3">

  <h3 className="font-semibold text-blue-700">
    Prescription
  </h3>

  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
    Total Medicines: {visit.prescription.items.length}
  </span>

</div>

    {visit.prescription.items.length === 0 ? (
      <p className="text-gray-500">
        No medicines prescribed.
      </p>
    ) : (
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">

  <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 border-b md:hidden">
    ← Swipe horizontally to view the complete prescription →
  </div>
        <table className="min-w-full overflow-hidden rounded-xl border border-gray-200 text-sm shadow-sm">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white">
  <tr>
    <th className="border px-3 py-3 text-center w-16">
  S.No.
</th>

<th className="border px-3 py-3 text-left">
  Medicine
</th>

    <th className="border px-3 py-3 text-center">
      Morning
    </th>

    <th className="border px-3 py-3 text-center">
      Afternoon
    </th>

    <th className="border px-3 py-3 text-center">
      Night
    </th>

    <th className="border px-3 py-3 text-center">
      Food
    </th>

    <th className="border px-3 py-3 text-center">
  Route
</th>

<th className="border px-3 py-3 text-center">
  SOS
</th>

<th className="border px-3 py-3 text-center">
  Duration
</th>
  </tr>
</thead>

          <tbody>

  {visit.prescription.items.map(
  (item: PrescriptionItem, index: number) => (

    <tr
  key={item.id}
  className={`transition-colors hover:bg-blue-100 ${
    index % 2 === 0 ? "bg-white" : "bg-gray-50"
  }`}
>
  <td className="border text-center font-bold">
  {index + 1}
</td>

      <td className="border px-4 py-3">

  <div className="font-semibold text-blue-900">

    {item.medicineName}

  </div>

  {item.strength && (

    <div className="mt-1 inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">

      {item.strength}

    </div>

  )}

</td>

      <td className="border text-center text-lg">

        {item.morning ? (
  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">
    ✔
  </span>
) : (
  "—"
)}

      </td>

      <td className="border text-center text-lg">

        {item.afternoon ? (
  <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold">
    ✔
  </span>
) : (
  "—"
)}

      </td>

      <td className="border text-center text-lg">

        {item.night ? (
  <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold">
    ✔
  </span>
) : (
  "—"
)}

      </td>

      <td className="border text-center font-medium">

        {item.beforeFood ? (
  <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
    Before Food
  </span>
) : item.afterFood ? (
  <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
    After Food
  </span>
) : (
  "-"
)}

      </td>
<td className="border text-center">

  {item.route ? (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
        item.route.toLowerCase() === "oral"
          ? "bg-green-100 text-green-700"
          : item.route.toLowerCase() === "iv"
          ? "bg-red-100 text-red-700"
          : item.route.toLowerCase() === "im"
          ? "bg-orange-100 text-orange-700"
          : item.route.toLowerCase() === "topical"
          ? "bg-purple-100 text-purple-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {item.route}
    </span>
  ) : (
    "-"
  )}

</td>

<td className="border text-center">

  {item.sos ? (
    <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
      SOS
    </span>
  ) : (
    <span className="inline-block bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
      No
    </span>
  )}

</td>

<td className="border text-center font-semibold text-blue-700">

        {item.duration ? (
  <span
    className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
      item.duration.toLowerCase().includes("day")
        ? "bg-blue-100 text-blue-700"
        : item.duration.toLowerCase().includes("week")
        ? "bg-green-100 text-green-700"
        : item.duration.toLowerCase().includes("month")
        ? "bg-purple-100 text-purple-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {item.duration}
  </span>
) : (
  "-"
)}

      </td>

    </tr>

  ))}

</tbody>
        </table>
      </div>
    )}
  </div>
)}
<div className="mt-8 grid md:grid-cols-2 gap-6">

  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">

  <div className="flex items-center gap-2 mb-3">

    <span className="text-2xl">🔬</span>

    <h3 className="font-bold text-yellow-700">
      Investigations
    </h3>

  </div>

  <p className="whitespace-pre-wrap text-gray-700">
    {visit.prescription?.investigations || "No investigations advised."}
  </p>

</div>

  <div className="bg-green-50 border border-green-200 rounded-xl p-5">

  <div className="flex items-center gap-2 mb-3">

    <span className="text-2xl">🩺</span>

    <h3 className="font-bold text-green-700">
      Advice
    </h3>

  </div>

  <p className="whitespace-pre-wrap text-gray-700">
    {visit.advice || "No advice recorded."}
  </p>

</div>

  <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">

  <div className="flex items-center gap-2 mb-3">

    <span className="text-2xl">📝</span>

    <h3 className="font-bold text-purple-700">
      Clinical Notes
    </h3>

  </div>

  <p className="whitespace-pre-wrap text-gray-700">
    {visit.prescription?.notes || "No notes available."}
  </p>

</div>

  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

  <div className="flex items-center gap-2 mb-3">

    <span className="text-2xl">📅</span>

    <h3 className="font-bold text-blue-700">
      Follow-up
    </h3>

  </div>

  <p className="text-gray-700 font-medium">
    {visit.followUpDate
      ? new Date(visit.followUpDate).toLocaleDateString()
      : "Not Scheduled"}
  </p>

</div>

</div>

<div className="mt-8 flex flex-wrap gap-3 border-t pt-6">

  <button
    onClick={() => router.push(`/opd/view/${visit.id}`)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all"
  >
    👁 View Visit
  </button>

  <button
    onClick={() => router.push(`/opd/edit/${visit.id}`)}
    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold transition-all"
  >
    ✏️ Edit Visit
  </button>

  <button
    disabled={!visit.prescription}
    onClick={() => {
      if (!visit.prescription) return;

      router.push(
        `/prescriptions/${visit.prescription.id}/print`
      );
    }}
    className={`px-4 py-2 rounded-lg text-white ${
      visit.prescription
        ? "bg-gray-700 hover:bg-gray-800"
        : "bg-gray-300 cursor-not-allowed"
    }`}
  >
    🖨 Print Prescription
  </button>
<button
  onClick={() =>
    router.push(
      `/opd?patientId=${patientId}&followUpVisitId=${visit.id}`
    )
  }
  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition-all"
>
  🔄 Follow-up
</button>
</div>
  </div>

        </div>
      )}

    </div>
  ))}
</div>
      )}
    </div>
  );
}