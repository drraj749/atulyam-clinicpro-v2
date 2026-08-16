"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type PrescriptionItem = {
  id: number;
  medicineName: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instruction?: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  beforeFood: boolean;
  afterFood: boolean;
  sos: boolean;
  quantity?: number;
  route?: string;
};

type Visit = {
  id: number;
  opdNo: string;
  doctor: string;
  department: string;

  complaint?: string;
  examination?: string;
  diagnosis?: string;
  advice?: string;

  bp?: string;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  height?: number;
  weight?: number;

  fee?: number;
  paymentMode?: string;

  followUpDate?: string;
  createdAt: string;

  patient: {
    patientId: string;
    firstName: string;
    lastName?: string;
    age: number;
    gender: string;
    mobile: string;
    address?: string;
    bloodGroup?: string;
  };

  prescription?: {
    id: number;
    notes?: string;
    items: PrescriptionItem[];
  };
};

export default function OPDPrintPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<Visit | null>(null);

  useEffect(() => {
    loadVisit();
  }, []);

  async function loadVisit() {
    try {
      const response = await fetch(`/api/opd/${params.id}`);

      const json = await response.json();

      if (!response.ok) {
        alert(json.message || "Unable to load visit.");
        return;
      }

      setVisit(json.visit);
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  }

  function printPage() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading OPD Record...
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        OPD Record Not Found
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {

          body {
            margin:0;
            background:white;
          }

          .no-print{
            display:none !important;
          }

          .page{
            box-shadow:none !important;
            border:none !important;
          }

        }
      `}</style>

      <div className="bg-gray-200 min-h-screen py-8">

        <div className="no-print flex justify-center gap-4 mb-6">

          <button
            onClick={() => router.back()}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg"
          >
            Back
          </button>

          <button
            onClick={printPage}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Print
          </button>

        </div>

        <div className="page max-w-5xl mx-auto bg-white shadow-lg p-10">

<div className="border-b-2 pb-5">

  <div className="flex items-center justify-between">

    {/* Logo */}
    <div className="w-32 flex justify-start flex-shrink-0">
      <img
        src="/images/logo.png"
        alt="Hospital Logo"
        className="w-24 h-24 object-contain"
      />
    </div>

    {/* Hospital Details */}
    <div className="flex-1 text-center px-4">
      <h1 className="text-4xl font-extrabold tracking-wide text-blue-900">
        ATULYAM HOSPITAL
      </h1>

      <p className="font-semibold">
        Born To Serve
      </p>

      <p>Garwar, Ballia, Uttar Pradesh</p>

      <p>Mob : +91 9123441452</p>

      <p className="font-semibold mt-2">
        OPD CONSULTATION RECORD
      </p>
    </div>

    {/* QR Codes */}
    <div className="w-40 flex justify-end gap-4 flex-shrink-0">

      <div className="text-center">
        <Image
          src="/images/whatsapp-qr.png"
          alt="WhatsApp"
          width={70}
          height={70}
        />
        <p className="text-xs">WhatsApp</p>
      </div>

      <div className="text-center">
        <Image
          src="/images/maps-qr.png"
          alt="Location"
          width={70}
          height={70}
        />
        <p className="text-xs">Location</p>
      </div>

    </div>

  </div>

</div>

          <div className="grid grid-cols-2 gap-6 mt-8">

            <div>

              <p><b>UHID :</b> {visit.patient.patientId}</p>

              <p>
                <b>Patient :</b>{" "}
                {visit.patient.firstName} {visit.patient.lastName}
              </p>

              <p>
                <b>Age / Gender :</b>{" "}
                {visit.patient.age} Years / {visit.patient.gender}
              </p>

              <p>
                <b>Mobile :</b> {visit.patient.mobile}
              </p>

              <p>
                <b>Blood Group :</b>{" "}
                {visit.patient.bloodGroup || "-"}
              </p>

            </div>

            <div>

              <p><b>OPD No :</b> {visit.opdNo}</p>

              <p>
                <b>Date :</b>{" "}
                {new Date(visit.createdAt).toLocaleString()}
              </p>

              <p>
                <b>Doctor :</b> {visit.doctor}
              </p>

              <p>
                <b>Department :</b> {visit.department}
              </p>

            </div>

          </div>

          <div className="border rounded-lg mt-8 p-4">

            <h2 className="font-bold text-lg mb-3">
              Vital Signs
            </h2>

            <div className="grid grid-cols-3 gap-4">

              <p><b>BP :</b> {visit.bp || "-"}</p>

              <p><b>Pulse :</b> {visit.pulse || "-"}</p>

              <p><b>Temp :</b> {visit.temperature || "-"}</p>

              <p><b>SpO₂ :</b> {visit.spo2 || "-"}</p>

              <p><b>Height :</b> {visit.height || "-"}</p>

              <p><b>Weight :</b> {visit.weight || "-"}</p>

            </div>

          </div>

          <div className="border rounded-lg mt-6 p-4">

            <h2 className="font-bold text-lg mb-2">
              Chief Complaint
            </h2>

            <p>{visit.complaint || "-"}</p>

          </div>

          <div className="border rounded-lg mt-6 p-4">

            <h2 className="font-bold text-lg mb-2">
              Clinical Examination
            </h2>

            <p>{visit.examination || "-"}</p>

          </div>

          <div className="border rounded-lg mt-6 p-4">

            <h2 className="font-bold text-lg mb-2">
              Diagnosis
            </h2>

            <p>{visit.diagnosis || "-"}</p>

          </div>

                    <div className="border rounded-lg mt-6 p-4">

            <h2 className="font-bold text-lg mb-2">
              Advice
            </h2>

            <p>{visit.advice || "-"}</p>

          </div>

          {visit.prescription && (
            <div className="border rounded-lg mt-6 p-4">

              <h2 className="font-bold text-lg mb-4">
                Prescription
              </h2>

              <table className="w-full border border-collapse">

                <thead>

                  <tr className="bg-gray-100">

                    <th className="border p-2 text-left">Medicine</th>

                    <th className="border p-2">Dose</th>

                    <th className="border p-2">Frequency</th>

                    <th className="border p-2">Duration</th>

                    <th className="border p-2">Instruction</th>

                  </tr>

                </thead>

                <tbody>

                  {visit.prescription.items.map((item) => (

                    <tr key={item.id}>

                      <td className="border p-2">
                        <div className="font-semibold">
                          {item.medicineName}
                        </div>

                        <div className="text-sm text-gray-600">
                          {item.strength || ""}
                        </div>
                      </td>

                      <td className="border p-2 text-center">
                        {item.dosage || "-"}
                      </td>

                      <td className="border p-2 text-center">
                        {item.frequency || "-"}
                      </td>

                      <td className="border p-2 text-center">
                        {item.duration || "-"}
                      </td>

                      <td className="border p-2">
                        {item.instruction || "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {visit.prescription.notes && (

                <div className="mt-4">

                  <h3 className="font-semibold">
                    Notes
                  </h3>

                  <p>
                    {visit.prescription.notes}
                  </p>

                </div>

              )}

            </div>
          )}

          <div className="grid grid-cols-2 gap-8 mt-8">

            <div>

              <p>
                <b>Consultation Fee :</b> ₹{visit.fee ?? "-"}
              </p>

              <p>
                <b>Payment Mode :</b> {visit.paymentMode || "-"}
              </p>

              <p>
                <b>Follow Up :</b>{" "}
                {visit.followUpDate
                  ? new Date(visit.followUpDate).toLocaleDateString()
                  : "-"}
              </p>

            </div>

            <div className="text-right">

              <div className="mt-16">

                <p className="font-semibold">
                  {visit.doctor}
                </p>

                <p className="text-sm">
                  Consultant Physician
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </>
  );
}