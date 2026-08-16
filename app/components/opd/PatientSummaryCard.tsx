"use client";

type Patient = {
  patientId: string;
  firstName: string;
  lastName?: string;
  age: number;
  gender: string;
  mobile: string;
};

type Props = {
  patient: Patient | null;
};

export default function PatientSummaryCard({ patient }: Props) {
  if (!patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h2 className="text-red-700 font-semibold">
          Patient not found
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <div className="grid grid-cols-5 gap-4">

        <Info
          title="UHID"
          value={patient.patientId}
        />

        <Info
          title="Name"
          value={`${patient.firstName} ${patient.lastName ?? ""}`}
        />

        <Info
          title="Age"
          value={`${patient.age} Years`}
        />

        <Info
          title="Gender"
          value={patient.gender}
        />

        <Info
          title="Mobile"
          value={patient.mobile}
        />

      </div>

    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">
        {title}
      </div>

      <div className="font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}