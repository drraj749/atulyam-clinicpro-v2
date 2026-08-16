import type { OPDForm } from "@/types/opd";

type Props = {
  form: OPDForm;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function ConsultationCard({
  form,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-6">
        Consultation Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div>
          <label className="block mb-2 font-medium">
            Doctor
          </label>

          <select
            name="doctor"
            value={form.doctor}
            onChange={onChange}
            className="border rounded-lg w-full p-2"
          >
            <option value="">Select Doctor</option>
            <option>Dr. Rahul Kumar</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Department
          </label>

          <select
            name="department"
            value={form.department}
            onChange={onChange}
            className="border rounded-lg w-full p-2"
          >
            <option>General Medicine</option>
            <option>Cardiology</option>
            <option>Pulmonology</option>
            <option>Neurology</option>
            <option>Gastroenterology</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Consultation Fee
          </label>

          <input
            type="number"
            name="fee"
            value={form.fee}
            onChange={onChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Payment Mode
          </label>

          <select
            name="paymentMode"
            value={form.paymentMode}
            onChange={onChange}
            className="border rounded-lg w-full p-2"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Credit</option>
          </select>
        </div>

      </div>

    </div>
  );
}