"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName?: string;
  age: number;
  gender: string;
  mobile: string;

  isActive: boolean;
  archivedAt?: string | null;

  visits: {
    id: number;
    createdAt: string;
  }[];
};

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

const opdMode = searchParams.get("mode") === "opd";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
  "active" | "archived" | "all"
>("active");

  useEffect(() => {
  loadPatients();
}, [statusFilter]);

  async function loadPatients() {
    const res = await fetch(
  `/api/patients?status=${statusFilter}`
);
    const json = await res.json();

if (!json.success) {
  alert(json.message || "Unable to load patients.");
  return;
}

setPatients(json.patients);
setFilteredPatients(json.patients);
  }

  function handleSearch(value: string) {
    setSearch(value);

    const result = patients.filter(
      (p) =>
        p.patientId.toLowerCase().includes(value.toLowerCase()) ||
        p.firstName.toLowerCase().includes(value.toLowerCase()) ||
        (p.lastName ?? "").toLowerCase().includes(value.toLowerCase()) ||
        p.mobile.includes(value)
    );

    setFilteredPatients(result);
  }

  async function archivePatient(patientId: string, name: string) {
  const ok = confirm(
  `Archive "${name}"?

This patient will disappear from the active patient list.

Medical records will remain safe.

You can restore the patient later.`
);

if (!ok) return;

  try {
    const res = await fetch("/api/patients/" + patientId, {
      method: "DELETE",
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "Unable to archive patient.");
      return;
    }

    alert(
  json.archived
    ? "Patient archived successfully."
    : "Patient deleted permanently."
);

    loadPatients();
  } catch (error) {
    console.error(error);
    alert("Server Error.");
  }
}
async function restorePatient(patientId: string) {
  try {
    const res = await fetch("/api/patients/" + patientId, {
      method: "PATCH",
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.message || "Unable to restore patient.");
      return;
    }

    alert("Patient restored successfully.");

    loadPatients();
  } catch (error) {
    console.error(error);
    alert("Server Error.");
  }
}
  return (
  <div
    style={{
      padding: 30,
      fontFamily: "Arial",
      background: "#eef4ff",
      minHeight: "100vh",
    }}
  >
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 16,
        background: "#2563eb",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30,
      }}
    >
      👥
    </div>

    <div>
      <h1
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        {opdMode ? "Select Patient for OPD" : "Patient Management"}
      </h1>

      <p
        style={{
          marginTop: 6,
          color: "#6b7280",
          fontSize: 15,
        }}
      >
        {opdMode
  ? "Select a patient to start OPD consultation"
  : "Manage registered patients, OPD history and records"}
      </p>
    </div>
  </div>
</div>

        <button
          onClick={() => router.push("/patients/new")}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          + Register Patient
        </button>
</div>

</div>
<div
  style={{
    display: "flex",
    gap: 12,
    marginBottom: 20,
  }}
>
  <button
    onClick={() => setStatusFilter("active")}
    style={button(
      statusFilter === "active"
        ? "#2563eb"
        : "#6b7280"
    )}
  >
    Active
  </button>

  <button
    onClick={() => setStatusFilter("archived")}
    style={button(
      statusFilter === "archived"
        ? "#dc2626"
        : "#6b7280"
    )}
  >
    Archived
  </button>

  <button
    onClick={() => setStatusFilter("all")}
    style={button(
      statusFilter === "all"
        ? "#16a34a"
        : "#6b7280"
    )}
  >
    All
  </button>
</div>
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#ffffff",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  }}
>
  <span style={{ fontSize: 20 }}>🔍</span>

  <input
    type="text"
    placeholder="Search by UHID, Name or Mobile Number..."
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
    style={{
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: 15,
      background: "transparent",
    }}
  />

  <span
    style={{
      background: "#2563eb",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: 999,
      fontWeight: 600,
      fontSize: 13,
    }}
  >
    {filteredPatients.length} Found
  </span>
</div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,.08)",
        }}
      >
        <thead
  style={{
    background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 5,
  }}
>
              <tr
  style={{
    height: 55,
  }}
>

      <th style={{ padding: 14 }}>🆔 UHID</th>
      <th>👤 Patient</th>
      <th>🎂 Age</th>
      <th>⚧ Gender</th>
      <th>☎ Contact</th>
      <th>🩺 Visits</th>
      <th>📅 Last Visit</th>
      <th style={{ width: "360px" }}>⚙ Actions</th>

    </tr>
        </thead>

        <tbody>
          {filteredPatients.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#777",
                }}
              >
                No Patients Found
              </td>
            </tr>
          ) : (
            filteredPatients.map((patient) => (
              <tr
  key={patient.id}
  style={{
    borderBottom: "1px solid #e5e7eb",
    background: patients.indexOf(patient) % 2 === 0 ? "#ffffff" : "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#eff6ff";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background =
      patients.indexOf(patient) % 2 === 0 ? "#ffffff" : "#f9fafb";
  }}
>
                <td style={{ padding: 12 }}>
  <span
    style={{
      display: "inline-block",
      background: "#dbeafe",
      color: "#1d4ed8",
      padding: "6px 12px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: 0.5,
    }}
  >
    {patient.patientId}
  </span>
</td>


                <td style={{ padding: 12 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#2563eb",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {`${patient.firstName.charAt(0)}${(patient.lastName ?? "").charAt(0)}`.toUpperCase()}
    </div>

    <div>
      <div
        style={{
          fontWeight: 600,
          color: "#111827",
        }}
      >
        {patient.firstName} {patient.lastName}
      </div>
{!patient.isActive && (
  <>
    <div
      style={{
        marginTop: 4,
        display: "inline-block",
        background: "#fee2e2",
        color: "#991b1b",
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      Archived
    </div>

    {patient.archivedAt && (
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: "#6b7280",
        }}
      >
        {new Date(patient.archivedAt).toLocaleDateString("en-IN")}
      </div>
    )}
  </>
)}
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        UHID: {patient.patientId}
      </div>
    </div>
  </div>
</td>

                <td style={{ padding: 12, textAlign: "center" }}>
  <span
    style={{
      display: "inline-block",
      minWidth: 42,
      padding: "5px 12px",
      borderRadius: 20,
      fontWeight: 700,
      fontSize: 13,
      background:
        patient.age < 18
          ? "#dbeafe"
          : patient.age < 60
          ? "#dcfce7"
          : "#fef3c7",
      color:
        patient.age < 18
          ? "#1d4ed8"
          : patient.age < 60
          ? "#15803d"
          : "#b45309",
    }}
  >
    {patient.age} Y
  </span>
</td>

                <td style={{ padding: 12 }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
  >
    <span
      style={{
        fontSize: 28,
        fontWeight: "bold",
        color:
          patient.gender.toLowerCase() === "male"
            ? "#0284c7"
            : patient.gender.toLowerCase() === "female"
            ? "#db2777"
            : "#7c3aed",
        lineHeight: 1,
      }}
    >
      {patient.gender.toLowerCase() === "male"
        ? "♂"
        : patient.gender.toLowerCase() === "female"
        ? "♀"
        : "⚧"}
    </span>

    <span
      style={{
        padding: "5px 12px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        background:
          patient.gender.toLowerCase() === "male"
            ? "#dbeafe"
            : patient.gender.toLowerCase() === "female"
            ? "#fce7f3"
            : "#ede9fe",
        color:
          patient.gender.toLowerCase() === "male"
            ? "#1d4ed8"
            : patient.gender.toLowerCase() === "female"
            ? "#be185d"
            : "#6d28d9",
      }}
    >
      {patient.gender}
    </span>
  </div>
</td>

                <td style={{ padding: 12 }}>
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#f3f4f6",
      color: "#111827",
      padding: "6px 12px",
      borderRadius: 20,
      fontWeight: 600,
      fontSize: 13,
    }}
  >
    ☎ {patient.mobile}
  </span>
</td>
<td style={{ padding: 12, textAlign: "center" }}>
  <span
    style={{
      display: "inline-block",
      minWidth: 40,
      background:
        patient.visits.length > 0 ? "#dcfce7" : "#fee2e2",
      color:
        patient.visits.length > 0 ? "#166534" : "#991b1b",
      padding: "6px 12px",
      borderRadius: 20,
      fontWeight: 700,
      fontSize: 13,
    }}
  >
    {patient.visits.length}
  </span>
</td>
<td style={{ padding: 12, textAlign: "center" }}>
  {patient.visits.length > 0 ? (
    <span
      style={{
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {new Date(patient.visits[0].createdAt).toLocaleDateString("en-IN")}
    </span>
  ) : (
    <span
      style={{
        background: "#f3f4f6",
        color: "#6b7280",
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 13,
      }}
    >
      Never
    </span>
  )}
</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
  onClick={() =>
  opdMode
    ? router.push(`/opd?patientId=${patient.patientId}`)
    : router.push(`/patients/${patient.patientId}`)
}
  style={{
    ...button("#2563eb"),
    minWidth: 85,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  }}
>
  👁 View
</button>

                    <button
  onClick={() =>
    router.push(`/patients/${patient.patientId}/edit`)
  }
  style={{
    ...button("#f59e0b"),
    minWidth: 85,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  }}
>
  ✏️ Edit
</button>

                    {!opdMode && (
  <button
    onClick={() =>
      router.push(`/opd?patientId=${patient.patientId}`)
    }
    style={button("#0f4c81")}
  >
    OPD
  </button>
)}

                    {patient.isActive ? (
  <button
    onClick={() =>
      archivePatient(
        patient.patientId,
        `${patient.firstName} ${patient.lastName ?? ""}`
      )
    }
    style={{
      ...button("#dc2626"),
      minWidth: 85,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }}
  >
    📦 Archive
  </button>
) : (
  <button
    onClick={() => restorePatient(patient.patientId)}
    style={{
      ...button("#16a34a"),
      minWidth: 85,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }}
  >
    ♻ Restore
  </button>
)}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function button(color: string) {
  return {
    background: color,
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  } as const;
}