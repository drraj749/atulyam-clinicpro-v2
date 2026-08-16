"use client";

import { use } from "react";
import OPDVisitForm from "@/app/components/opd/OPDVisitForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditOPDPage({
  params,
}: Props) {
  const { id } = use(params);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <OPDVisitForm visitId={Number(id)} />
    </div>
  );
}