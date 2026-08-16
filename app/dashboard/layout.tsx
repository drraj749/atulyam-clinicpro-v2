import Header from "@/app/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0">
      <Header />

      <main className="p-8">
        {children}
      </main>
    </div>
  );
}