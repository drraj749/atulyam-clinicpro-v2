type Props = {
  bp?: string;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  height?: number;
  weight?: number;
};

export default function VitalsView({
  bp,
  pulse,
  temperature,
  spo2,
  height,
  weight,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold text-blue-900 mb-6">
        Vital Signs
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

        <div className="border rounded-xl p-4 text-center">

          <p className="text-sm text-gray-500">
            Blood Pressure
          </p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            {bp || "-"}
          </p>

        </div>

        <div className="border rounded-xl p-4 text-center">

          <p className="text-sm text-gray-500">
            Pulse
          </p>

          <p className="text-2xl font-bold text-blue-700 mt-2">
            {pulse ?? "-"}
          </p>

          <p className="text-xs text-gray-400">
            bpm
          </p>

        </div>

        <div className="border rounded-xl p-4 text-center">

          <p className="text-sm text-gray-500">
            Temperature
          </p>

          <p className="text-2xl font-bold text-orange-600 mt-2">
            {temperature ?? "-"}
          </p>

          <p className="text-xs text-gray-400">
            °C
          </p>

        </div>

        <div className="border rounded-xl p-4 text-center">

          <p className="text-sm text-gray-500">
            SpO₂
          </p>

          <p className="text-2xl font-bold text-green-700 mt-2">
            {spo2 ?? "-"}
          </p>

          <p className="text-xs text-gray-400">
            %
          </p>

        </div>

        <div className="border rounded-xl p-4 text-center">

          <p className="text-sm text-gray-500">
            Height
          </p>

          <p className="text-2xl font-bold text-indigo-700 mt-2">
            {height ?? "-"}
          </p>

          <p className="text-xs text-gray-400">
            cm
          </p>

        </div>

        <div className="border rounded-xl p-4 text-center">

          <p className="text-sm text-gray-500">
            Weight
          </p>

          <p className="text-2xl font-bold text-purple-700 mt-2">
            {weight ?? "-"}
          </p>

          <p className="text-xs text-gray-400">
            kg
          </p>

        </div>

      </div>

    </div>
  );
}