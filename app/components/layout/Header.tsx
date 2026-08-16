"use client";

export default function Header() {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b px-8 py-5 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">
          🏥 Atulyam ClinicPro
        </h1>

        <p className="text-gray-500">
          Hospital Management System
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-gray-800">
          Dr. Rahul Kumar
        </p>

        <p className="text-sm text-gray-500">
          {today}
        </p>
      </div>
    </header>
  );
}