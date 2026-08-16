type Patient = {
  patientId: string;
  firstName: string;
  lastName?: string;
  age: number;
  gender: string;
  mobile: string;
  address?: string;
};

type Props = {
  patient: Patient;
};

export default function PatientProfileCard({ patient }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">

      <div className="flex items-center gap-6">

        <div className="h-20 w-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-3xl font-bold">
          {patient.firstName.charAt(0)}
        </div>

        <div>

          <h1 className="text-3xl font-bold text-blue-900">
            {patient.firstName} {patient.lastName}
          </h1>

          <p className="text-gray-500">
            UHID : {patient.patientId}
          </p>

        </div>

      </div>

      <hr className="my-8" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <div>

          <p className="text-gray-500 text-sm">
            Age
          </p>

          <p className="font-semibold text-lg">
            {patient.age} Years
          </p>

        </div>

        <div>

          <p className="text-gray-500 text-sm">
            Gender
          </p>

          <p className="font-semibold text-lg">
            {patient.gender}
          </p>

        </div>

        <div>

          <p className="text-gray-500 text-sm">
            Mobile
          </p>

          <p className="font-semibold text-lg">
            {patient.mobile}
          </p>

        </div>

        <div>

          <p className="text-gray-500 text-sm">
            Address
          </p>

          <p className="font-semibold text-lg">
            {patient.address || "-"}
          </p>

        </div>

      </div>

    </div>
  );
}