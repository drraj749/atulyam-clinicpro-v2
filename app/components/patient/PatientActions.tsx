"use client";

import { useRouter } from "next/navigation";

type Props = {
  patientId: string;
};

export default function PatientActions({
  patientId,
}: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <button
          onClick={() =>
            router.push(`/opd?patientId=${patientId}`)
          }
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-4 font-semibold transition"
        >
          🔄
         <br />
         Follow-up Visit
        </button>

        <button
          onClick={() =>
            router.push(`/laboratory/new?patientId=${patientId}`)
          }
          className="bg-purple-700 hover:bg-purple-800 text-white rounded-lg py-4 font-semibold transition"
        >
          🧪
          <br />
          Lab
        </button>

        <button
          onClick={() =>
            router.push(`/billing/new?patientId=${patientId}`)
          }
          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-4 font-semibold transition"
        >
          💰
          <br />
          Billing
        </button>

        <button
          onClick={() =>
            router.push(`/ipd/admit?patientId=${patientId}`)
          }
          className="bg-red-700 hover:bg-red-800 text-white rounded-lg py-4 font-semibold transition"
        >
          🏥
          <br />
          Admit
        </button>

        <button
          onClick={() =>
            router.push(`/patients/${patientId}/edit`)
          }
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-4 font-semibold transition"
        >
          ✏️
          <br />
          Edit
        </button>

        <button
          onClick={() => window.print()}
          className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-4 font-semibold transition"
        >
          🖨️
          <br />
          Print Card
        </button>

      </div>

    </div>
  );
}