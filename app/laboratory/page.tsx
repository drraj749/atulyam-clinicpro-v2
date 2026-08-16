import LabOrderForm from "@/app/components/laboratory/LabOrderForm";
import LabOrderTable from "@/app/components/laboratory/LabOrderTable";
import LabReportEntry from "@/app/components/laboratory/LabReportEntry";
import LabTestForm from "@/app/components/laboratory/LabTestForm";
import LabTestTable from "@/app/components/laboratory/LabTestTable";

export default function LaboratoryPage() {
  return (
    <main className="p-8 space-y-8">
      <LabOrderForm />

      <LabOrderTable />

      <LabReportEntry />

      <LabTestForm />

      <LabTestTable />
    </main>
  );
}