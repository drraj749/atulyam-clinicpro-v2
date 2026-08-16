type Medicine = {
  id: number;
  medicineName: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number | null;
  route?: string;
  instruction?: string;
  morning?: boolean;
  afternoon?: boolean;
  night?: boolean;
  beforeFood?: boolean;
  afterFood?: boolean;
  sos?: boolean;
};

type Props = {
  medicines: Medicine[];
};

function getSchedule(medicine: Medicine) {
  // =========================
  // ONCE WEEKLY
  // =========================
  if (medicine.frequency === "ONCE_WEEKLY") {
    const duration =
      medicine.duration
        ?.replace(" Days", "D")
        .replace(" Day", "D")
        .replace(" Months", "M")
        .replace(" Month", "M") ?? "";

    return `Once Weekly ${duration}`.trim();
  }

  // =========================
  // ONE TIME ONLY
  // =========================
  if (medicine.frequency === "ONE_TIME") {
    return "One Time Only";
  }

  // =========================
  // NORMAL FREQUENCIES
  // =========================
  const morning = medicine.morning ? "1" : "0";
  const afternoon = medicine.afternoon ? "1" : "0";
  const night = medicine.night ? "1" : "0";

  const food = medicine.beforeFood
    ? "BF"
    : medicine.afterFood
    ? "AF"
    : "";

  const duration =
    medicine.duration
      ?.replace(" Days", "D")
      .replace(" Day", "D")
      .replace(" Months", "M")
      .replace(" Month", "M") ?? "";

  return `${morning}-${afternoon}-${night} ${food} ${duration}`.trim();
}

export default function PrescriptionMedicineTable({
  medicines,
}: Props) {
  return (
    <div className="w-full">
      {/* Rx Header */}
      <div className="flex items-center mb-1">
        <span className="text-2xl font-bold">℞</span>

        <div className="flex-1 border-b border-black ml-2"></div>
      </div>

      {/* Medicine Table */}
      <table className="w-full text-[12px] border-collapse table-fixed">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="w-8 text-left py-1">
              S.No.
            </th>

            <th className="text-left py-1">
              Medicine
            </th>

            <th className="w-24 text-left py-1">
              Dosage
            </th>

            <th className="w-32 text-left py-1">
              Schedule
            </th>

            <th className="w-12 text-center py-1">
              Qty
            </th>
          </tr>
        </thead>

        <tbody>
          {medicines.map((medicine, index) => (
            <tr
              key={medicine.id}
              className="border-b border-gray-300"
            >
              {/* S.No */}
              <td className="py-1 align-middle font-semibold whitespace-nowrap">
                {index + 1}.
              </td>

              {/* Medicine */}
              <td className="py-1 align-middle">
                <div className="font-semibold whitespace-nowrap">
                  {medicine.medicineName}

                  {medicine.strength && (
                    <span className="font-normal">
                      {" "}
                      {medicine.strength}
                    </span>
                  )}

                  {medicine.route && (
                    <span className="font-normal text-[10px]">
                      {" "}
                      ({medicine.route})
                    </span>
                  )}
                </div>

                {/* Instruction only appears if entered */}
                {medicine.instruction && (
                  <div className="text-[10px] italic leading-tight">
                    {medicine.instruction}
                  </div>
                )}
              </td>

              {/* Dosage */}
              <td className="py-1 align-middle whitespace-nowrap">
                {medicine.dosage || "-"}
              </td>

              {/* Schedule */}
              <td className="py-1 align-middle whitespace-nowrap">
                {getSchedule(medicine)}
              </td>

              {/* Quantity */}
              <td className="py-1 align-middle text-center font-semibold whitespace-nowrap">
                {medicine.quantity !== null &&
                medicine.quantity !== undefined
                  ? medicine.quantity
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}