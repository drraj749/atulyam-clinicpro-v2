"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const pathname = usePathname();

  const isPrintPage =
    pathname.startsWith("/prescriptions/") &&
    pathname.endsWith("/print");

  if (isPrintPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}