type Props = {
  complaint?: string;
  examination?: string;
  diagnosis?: string;
  advice?: string;
};

export default function ClinicalNotesView({
  complaint,
  examination,
  diagnosis,
  advice,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold text-blue-900 mb-6">
        Clinical Notes
      </h2>

      <div className="space-y-6">

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Chief Complaint
          </h3>

          <div className="border rounded-lg bg-gray-50 p-4 min-h-[80px] whitespace-pre-wrap">
            {complaint || "-"}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Examination
          </h3>

          <div className="border rounded-lg bg-gray-50 p-4 min-h-[80px] whitespace-pre-wrap">
            {examination || "-"}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Diagnosis
          </h3>

          <div className="border rounded-lg bg-gray-50 p-4 min-h-[80px] whitespace-pre-wrap">
            {diagnosis || "-"}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            Advice
          </h3>

          <div className="border rounded-lg bg-gray-50 p-4 min-h-[80px] whitespace-pre-wrap">
            {advice || "-"}
          </div>
        </div>

      </div>

    </div>
  );
}