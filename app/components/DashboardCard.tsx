type DashboardCardProps = {
  title: string;
  value: string;
  color: string;
};

export default function DashboardCard({
  title,
  value,
  color,
}: DashboardCardProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-md p-6 border-l-8 hover:shadow-xl transition-all duration-300"
      style={{
        borderLeftColor: color,
      }}
    >
      <p className="text-gray-500 text-sm font-medium">
        {title}
      </p>

      <h2
        className="text-4xl font-bold mt-3"
        style={{
          color,
        }}
      >
        {value}
      </h2>
    </div>
  );
}