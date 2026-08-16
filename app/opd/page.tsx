import { Suspense } from "react";
import OPDVisitForm from "../components/opd/OPDVisitForm";

function OPDContent() {
  return <OPDVisitForm />;
}

export default function OPDPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-lg">
          Loading...
        </div>
      }
    >
      <OPDContent />
    </Suspense>
  );
}