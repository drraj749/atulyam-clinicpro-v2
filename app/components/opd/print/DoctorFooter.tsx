type Props = {
  doctorName: string;
  qualification?: string;
  registrationNo?: string;
  hospitalName: string;
  followUpDate?: string;
  prescriptionFooter?: string;
};

export default function DoctorFooter({
  doctorName,
  qualification,
  registrationNo,
  followUpDate,
  prescriptionFooter,
}: Props) {
  return (
    <div className="mt-4">

      <div className="flex justify-between items-end">

        <div className="text-[13px]">
  <span className="font-bold">Follow-up :</span>{" "}
  {followUpDate || "As Advised"}
</div>

        <div className="text-right">

          <div className="font-bold text-[15px]">
            {doctorName}
          </div>

          {qualification && (
            <div className="text-[12px]">
              {qualification}
            </div>
          )}

          {registrationNo && (
            <div className="text-[11px]">
              Reg. No. {registrationNo}
            </div>
          )}

          <div className="text-[11px]">
            Consultant Physician
          </div>

        </div>

      </div>

      <div className="border-t mt-3"></div>

    </div>
  );
}