import DashboardCard from "@/app/components/DashboardCard";

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">
        Welcome to Atulyam ClinicPro
      </h1>

      <p className="text-gray-500 mt-2">
        Hospital Management System Dashboard
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

        <DashboardCard
          title="Today's OPD"
          value="15"
          color="#1976d2"
        />

        <DashboardCard
          title="IPD Patients"
          value="4"
          color="#2e7d32"
        />

        <DashboardCard
          title="Today's Revenue"
          value="₹8,500"
          color="#ef6c00"
        />

        <DashboardCard
          title="Lab Tests"
          value="12"
          color="#8e24aa"
        />

      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <h2 className="text-xl font-bold mb-4">
          Today's Activity
        </h2>

        <ul className="space-y-2">

          <li>✅ OPD Registration</li>

          <li>✅ Patient Management</li>

          <li>🧪 Laboratory</li>

          <li>💊 Pharmacy</li>

          <li>💰 Billing</li>

        </ul>

      </div>
    </>
  );
}